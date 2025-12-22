import { Module } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { SolicitacoesController } from './solicitacoes.controller';
import { PrismaService } from '../../../../prisma/prisma.service';

@Module({
    controllers: [SolicitacoesController],
    providers: [SolicitacoesService, PrismaService],
})
export class SolicitacoesModule { }