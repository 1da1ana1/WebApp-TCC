import { Module } from '@nestjs/common';
import { ContestationsController } from './contestations.controller';
import { ContestationsService } from './contestations.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ContestationsController],
  providers: [ContestationsService, PrismaService],
})
export class ContestationsModule {}
