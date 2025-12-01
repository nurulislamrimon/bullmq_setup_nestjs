import { Inject, Injectable } from '@nestjs/common';
import { BullMQManager } from 'src/bullmq/bullmq.provider';
import { BULLMQ_QUEUE_MANAGER } from 'src/bullmq/bullmq.provider';
import { IEmailJob } from 'src/lib/email/email.interface';

const EMAIL_QUEUE = 'email_queue';
const EMAIL_JOB_NAME = 'send_email';

@Injectable()
export class EmailQueueProducer {
  constructor(
    @Inject(BULLMQ_QUEUE_MANAGER)
    private readonly bullMQManager: BullMQManager,
  ) {}

  async enqueueEmail(job: IEmailJob): Promise<void> {
    await this.bullMQManager.addJob<IEmailJob>(
      EMAIL_QUEUE,
      EMAIL_JOB_NAME,
      job,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
