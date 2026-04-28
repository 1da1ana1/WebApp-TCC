import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// Sem controller — o service é exportado para ser consumido por outros módulos.
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
