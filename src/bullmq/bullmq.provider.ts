/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleDestroy, Provider } from '@nestjs/common';
import { Queue, Worker, JobsOptions, RepeatOptions, Processor } from 'bullmq';
import IORedis, { Redis } from 'ioredis';

export const BULLMQ_QUEUE_MANAGER = 'BULLMQ_QUEUE_MANAGER';

@Injectable()
export class BullMQManager implements OnModuleDestroy {
  private readonly connection: Redis;
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();

  constructor() {
    this.connection = new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      maxRetriesPerRequest: null,
    });

    this.connection.on('connect', () =>
      console.log('🔴 Redis connected for BullMQ'),
    );

    this.connection.on('error', (err) =>
      console.error('❌ Redis connection error:', err.message),
    );
  }

  async onModuleDestroy() {
    console.log('🛑 Shutting down BullMQ...');
    for (const worker of this.workers.values()) {
      await worker.close().catch(console.error);
    }
    for (const queue of this.queues.values()) {
      await queue.close().catch(console.error);
    }
    this.connection.disconnect();
    console.log('🟢 BullMQ shutdown complete');
  }

  public getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      console.log(`📡 Creating BullMQ Queue: ${queueName}`);
      const queue = new Queue(queueName, { connection: this.connection });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  public async addJob<Data = unknown>(
    queueName: string,
    jobName: string,
    data: Data,
    options?: JobsOptions,
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, data as any, options);
  }

  public async addRepeatableJob<Data = unknown>(
    queueName: string,
    jobName: string,
    data: Data,
    repeat: RepeatOptions,
    options?: Omit<JobsOptions, 'repeat'>,
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, data as any, { ...options, repeat });
  }

  public async removeRepeatableJob(
    queueName: string,
    jobName: string,
    repeat: { cron?: string; every?: number },
  ): Promise<void> {
    const queue = this.getQueue(queueName);

    const schedulers = await queue.getJobSchedulers();

    const found = schedulers.find((s) => {
      if (s.name !== jobName) return false;

      if (repeat.cron && s.pattern === repeat.cron) return true;

      if (repeat.every && s.pattern === `every_${repeat.every}`) return true;

      return false;
    });

    if (!found) {
      console.warn(`⚠ No matching job scheduler found for removal`);
      return;
    }

    console.log(`🗑 Removing scheduler ID: ${found.id}`);

    // NEW API — no deprecation warnings
    await queue.removeJobScheduler(found.id as string);
  }

  public createWorker<Data = unknown>(
    queueName: string,
    processor: Processor<Data>,
  ): Worker {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    console.log(`👷 Creating Worker for queue "${queueName}"`);

    const worker = new Worker(queueName, processor as any, {
      connection: this.connection,
    });

    worker.on('completed', (job) =>
      console.log(`✅ Job ${job.id} completed → [${queueName}]`),
    );

    worker.on('failed', (job, err) =>
      console.error(`❌ Job ${job?.id} failed → [${queueName}]:`, err?.message),
    );

    this.workers.set(queueName, worker);
    return worker;
  }
}

export const BullMQManagerProvider: Provider = {
  provide: BULLMQ_QUEUE_MANAGER,
  useClass: BullMQManager,
};
