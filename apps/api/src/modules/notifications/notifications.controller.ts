import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Notificações retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMine(@Request() req: { user: { sub: number } }) {
    return this.notificationsService.getMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Notificação de outro usuário' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async markRead(
    @Request() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markRead(req.user.sub, id);
  }
}
