import { Module } from '@nestjs/common';
import { ContestationsController } from './contestations.controller';
import { ContestationsService } from './contestations.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ContestationsController],
  providers: [ContestationsService, PrismaService],
})
export class ContestationsModule {}
