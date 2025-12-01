import { Inject, Injectable } from '@nestjs/common';
import { BullMQManager } from 'src/bullmq/bullmq.provider';
import { BULLMQ_QUEUE_MANAGER } from 'src/bullmq/bullmq.provider';

const EMAIL_QUEUE = 'test_schedule_queue';
const EMAIL_JOB_NAME = 'send_test_schedule';

@Injectable()
export class TestScheduleQueueProducer {
  constructor(
    @Inject(BULLMQ_QUEUE_MANAGER)
    private readonly bullMQManager: BullMQManager,
  ) {}

  async enqueueTestSchedule(job: { delay: number }): Promise<void> {
    await this.bullMQManager.addJob(
      EMAIL_QUEUE,
      EMAIL_JOB_NAME,
      {
        message: 'Testing schedule',
        delay: job.delay,
      },
      {
        attempts: 3,
        delay: job.delay,
        backoff: {
          type: 'exponential',
          delay: job.delay,
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
