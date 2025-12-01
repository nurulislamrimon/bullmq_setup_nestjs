import { Injectable } from '@nestjs/common';
import { EmailQueueProducer } from './bullmq/producers/email.producer';

@Injectable()
export class AppService {
  constructor(private readonly emailQueueProducer: EmailQueueProducer) {}
  async sendMail() {
    await this.emailQueueProducer.enqueueEmail({
      to: 'nir@gmail.com',
      subject: 'Testing Bull',
      template: '<h1>Hello</h1>',
      payload: { message: 'Hello Nurul' },
    });
    return { success: true, message: 'KIO' };
  }
}
