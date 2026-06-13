import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ContestationsService } from './contestations.service';
import { CreateContestationDto } from './dto/create-contestation.dto';
import { ResolveContestationDto } from './dto/resolve-contestation.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Contestations')
@ApiBearerAuth()
@Controller('contestations')
export class ContestationsController {
  constructor(private readonly contestationsService: ContestationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post()
  @ApiOperation({ summary: 'Contestar a vaga do semestre ativo (docente)' })
  @ApiBody({ type: CreateContestationDto })
  @ApiResponse({ status: 201, description: 'Contestação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Fora do prazo / pendência existente / validação' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a TEACHER' })
  @ApiResponse({ status: 404, description: 'Sem semestre ativo ou vaga para contestar' })
  async create(
    @Request() req: { user: { sub: number } },
    @Body() dto: CreateContestationDto,
  ) {
    return this.contestationsService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COORDINATOR')
  @Get()
  @ApiOperation({ summary: 'Listar contestações pendentes (coordenador)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
  async findPending() {
    return this.contestationsService.findPending();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COORDINATOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Aceitar/recusar contestação (coordenador)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ResolveContestationDto })
  @ApiResponse({ status: 200, description: 'Contestação resolvida com sucesso' })
  @ApiResponse({ status: 400, description: 'Já resolvida / newQuantity ausente no ACCEPTED' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
  @ApiResponse({ status: 404, description: 'Contestação não encontrada' })
  async resolve(
    @Request() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveContestationDto,
  ) {
    return this.contestationsService.resolve(req.user.sub, id, dto);
  }
}
