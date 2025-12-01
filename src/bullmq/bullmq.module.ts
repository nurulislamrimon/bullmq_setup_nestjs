import { Module } from '@nestjs/common';
import { BullMQManagerProvider } from './bullmq.provider';
import { SendEmailConsumer } from './consumer/email.consumer';

@Module({
  controllers: [],
  providers: [BullMQManagerProvider, SendEmailConsumer],
  exports: [BullMQManagerProvider],
})
export class BullmqModule {}
