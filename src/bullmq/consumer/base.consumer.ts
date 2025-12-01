/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { BULLMQ_QUEUE_MANAGER, BullMQManager } from '../bullmq.provider';

@Injectable()
export abstract class BaseBullConsumer<Data = any> implements OnModuleInit {
  constructor(
    @Inject(BULLMQ_QUEUE_MANAGER)
    protected readonly bull: BullMQManager,
  ) {}

  /**
   * MUST BE IMPLEMENTED BY CHILD CLASSES
   */
  protected abstract queueName: string;
  protected abstract jobName: string;

  protected abstract dlqQueueName: string;
  protected abstract dlqJobName: string;

  protected abstract handleJob(data: Data): Promise<void>;
  protected abstract handleDLQ(data: Data): Promise<void>;

  onModuleInit() {
    this.startMainConsumer();
    this.startDLQConsumer();
  }

  private startMainConsumer() {
    const worker = this.bull.createWorker<Data>(this.queueName, async (job) => {
      if (job.name !== this.jobName) return;
      await this.handleJob(job.data as Data);
    });

    worker.on('failed', async (job, err) => {
      console.error(`❌ Job failed in [${this.queueName}]:`, err.message);

      const attempts = job?.opts.attempts ?? 1;

      if (job && job.attemptsMade >= attempts) {
        console.log(`➡ Moving job to DLQ [${this.dlqQueueName}]`);

        await this.bull.addJob<Data>(
          this.dlqQueueName,
          this.dlqJobName,
          job.data as Data,
        );
      }
    });
  }

  private startDLQConsumer() {
    this.bull.createWorker<Data>(this.dlqQueueName, async (job) => {
      if (job.name !== this.dlqJobName) return;
      await this.handleDLQ(job.data as Data);
    });
  }
}
