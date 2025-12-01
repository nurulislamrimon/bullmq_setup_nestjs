import { Injectable } from '@nestjs/common';
import { EmailQueueProducer } from './bullmq/producers/email.producer';
import { TestScheduleQueueProducer } from './bullmq/producers/test-schedule.producer';

@Injectable()
export class AppService {
  constructor(
    private readonly emailQueueProducer: EmailQueueProducer,
    private readonly testScheduleQueueProducer: TestScheduleQueueProducer,
  ) {}
  async sendMail() {
    await this.emailQueueProducer.enqueueEmail({
      to: 'nir@gmail.com',
      subject: 'Testing Bull',
      template: '<h1>Hello</h1>',
      payload: { message: 'Hello Nurul' },
    });
    return { success: true, message: 'KIO' };
  }
  async testSchedule() {
    await this.testScheduleQueueProducer.enqueueTestSchedule({
      delay: 10000,
    });
    return { success: true, message: 'KIO' };
  }
}
