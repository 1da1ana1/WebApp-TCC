import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CoordinatorService } from './coordinator.service';
import { TransferCoordinationDto } from './dto/transfer-coordination.dto';

@ApiTags('Coordinator')
@ApiBearerAuth()
@Controller('coordinator')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  /**
   * RF020 — Transfere a coordenação do coordenador logado para outro docente.
   * Restrito a COORDINATOR (JwtAuthGuard + RolesGuard).
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COORDINATOR')
  @Post('transfer')
  @ApiOperation({ summary: 'Transferir a coordenação para outro docente (RF020)' })
  @ApiResponse({ status: 201, description: 'Coordenação transferida com sucesso' })
  @ApiResponse({ status: 400, description: 'Alvo inválido (não é TEACHER, ou é o próprio)' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
  @ApiResponse({ status: 404, description: 'Docente alvo não encontrado' })
  @ApiResponse({ status: 500, description: 'Falha na transação (rollback aplicado)' })
  async transfer(
    @Request() req: { user: { sub: number } },
    @Body() body: TransferCoordinationDto,
  ) {
    return this.coordinatorService.transfer(req.user.sub, body.targetTeacherId);
  }
}
