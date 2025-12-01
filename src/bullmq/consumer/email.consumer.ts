import { Injectable } from '@nestjs/common';
import { BaseBullConsumer } from './base.consumer';
import { IEmailJob } from 'src/lib/email/email.interface';

@Injectable()
export class SendEmailConsumer extends BaseBullConsumer<IEmailJob> {
  protected queueName = 'email_queue';
  protected jobName = 'send_email';
  protected dlqQueueName = 'email_queue_dlq';
  protected dlqJobName = 'send_email_dlq';

  // MAIN JOB LOGIC
  protected async handleJob(data: IEmailJob): Promise<void> {
    await new Promise((res) => res('DONE'));
    console.log(data, '----------send email');
    // throw new NotFoundException('Test');
  }

  // DLQ HANDLER LOGIC
  protected async handleDLQ(data: IEmailJob): Promise<void> {
    await new Promise((res) => res('DONE'));
    console.log(data, '----------send dlq email');
  }
}
