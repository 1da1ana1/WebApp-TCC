import { Module } from '@nestjs/common';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [WhitelistController],
  providers: [WhitelistService, PrismaService],
})
export class WhitelistModule {}
