import { Injectable } from '@nestjs/common';
import { BaseBullConsumer } from './base.consumer';

@Injectable()
export class TestQueueConsumer extends BaseBullConsumer {
  protected queueName = 'test_schedule_queue';
  protected jobName = 'send_test_schedule';
  protected dlqQueueName = 'test_schedule_queue_dlq';
  protected dlqJobName = 'send_test_schedule_dlq';

  // MAIN JOB LOGIC
  protected async handleJob(data: {
    message: string;
    delay: number;
  }): Promise<void> {
    await new Promise((res) => res('DONE'));
    console.log(data, '----------send test_schedule');
    // throw new NotFoundException('Test');
  }

  // DLQ HANDLER LOGIC
  protected async handleDLQ(data: {
    message: string;
    delay: number;
  }): Promise<void> {
    await new Promise((res) => res('DONE'));
    console.log(data, '----------send dlq test_schedule');
  }
}
