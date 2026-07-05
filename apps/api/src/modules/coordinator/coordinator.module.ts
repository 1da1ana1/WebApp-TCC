import { Module } from '@nestjs/common';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorService } from './coordinator.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [CoordinatorController],
  providers: [CoordinatorService, PrismaService],
})
export class CoordinatorModule {}
