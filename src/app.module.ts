import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullmqModule } from './bullmq/bullmq.module';
import { EmailQueueProducer } from './bullmq/producers/email.producer';

@Module({
  imports: [BullmqModule],
  controllers: [AppController],
  providers: [AppService, EmailQueueProducer],
})
export class AppModule {}
