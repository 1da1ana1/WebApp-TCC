import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { LogsService } from './logs.service';

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'COORDINATOR')
  @Get('user/:userId')
  @ApiOperation({ summary: 'Logs de atividade de um usuário (paginado)' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Logs retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a TEACHER/COORDINATOR' })
  async getUserLogs(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = Number(page);
    const sizeNum = Number(pageSize);
    return this.logsService.getUserLogs(
      userId,
      Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1,
      Number.isInteger(sizeNum) && sizeNum > 0 ? sizeNum : 20,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COORDINATOR')
  @Get('aggregate')
  @ApiOperation({ summary: 'Agregações de atividade (RF016)' })
  @ApiResponse({ status: 200, description: 'Agregações retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
  async getAggregate() {
    return this.logsService.getAggregate();
  }
}
