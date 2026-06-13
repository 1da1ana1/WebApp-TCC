import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';

// Service exportado para ser disparado por outros módulos (requests, vacancies,
// contestations); controller expõe os endpoints do próprio usuário.
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
