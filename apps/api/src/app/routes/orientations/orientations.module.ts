import { Module } from '@nestjs/common';
import { OrientationsController } from './orientations.controller';
import { OrientationsService } from './orientations.service';

@Module({
  controllers: [OrientationsController],
  providers: [OrientationsService],
})
export class OrientationsModule {}
