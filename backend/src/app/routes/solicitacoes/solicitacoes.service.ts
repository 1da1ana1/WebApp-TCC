import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';

@Injectable()
export class SolicitacoesService {
    constructor(private prisma: PrismaService) { }

    async create(createSolicitacaoDto: CreateSolicitacaoDto) {
        return this.prisma.request.create({
            data: {
                studentId: createSolicitacaoDto.studentId,
                teacherId: createSolicitacaoDto.teacherId,
                status: 'pending', // ou o que for padrão
            },
        });
    }
}