import { Controller, Post, Body } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';

@Controller('solicitacoes')
export class SolicitacoesController {
    constructor(private readonly solicitacoesService: SolicitacoesService) { }

    @Post()
    create(@Body() createSolicitacaoDto: CreateSolicitacaoDto) {
        return this.solicitacoesService.create(createSolicitacaoDto);
    }
}