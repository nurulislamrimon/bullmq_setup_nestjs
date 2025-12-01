import { Module } from '@nestjs/common';
import { BullMQManagerProvider } from './bullmq.provider';
import { SendEmailConsumer } from './consumer/email.consumer';
import { TestQueueConsumer } from './consumer/test-schedule.consumer';

@Module({
  controllers: [],
  providers: [BullMQManagerProvider, SendEmailConsumer, TestQueueConsumer],
  exports: [BullMQManagerProvider],
})
export class BullmqModule {}
