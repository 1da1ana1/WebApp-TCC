import { Module } from '@nestjs/common';
import { OrientationsController } from './orientations.controller';
import { OrientationsService } from './orientations.service';
import { PrismaService } from '../../../../prisma/prisma.service';

@Module({
  controllers: [OrientationsController],
  providers: [OrientationsService, PrismaService],
})
export class OrientationsModule {}
