import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullmqModule } from './bullmq/bullmq.module';
import { EmailQueueProducer } from './bullmq/producers/email.producer';
import { TestScheduleQueueProducer } from './bullmq/producers/test-schedule.producer';

@Module({
  imports: [BullmqModule],
  controllers: [AppController],
  providers: [AppService, EmailQueueProducer, TestScheduleQueueProducer],
})
export class AppModule {}
