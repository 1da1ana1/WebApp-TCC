import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { OrientationsService } from './orientations.service';
import { UpdateOrientationStatusDto } from './dto/update-orientation-status.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

@ApiTags('Orientations')
@ApiBearerAuth()
@Controller('orientations')
export class OrientationsController {
	constructor(private readonly orientationsService: OrientationsService) {}

	@UseGuards(JwtAuthGuard)
	@Get('my-orientations')
	@ApiOperation({ summary: 'Listar orientações do usuário autenticado' })
	@ApiResponse({ status: 200, description: 'Orientações retornadas com sucesso' })
	@ApiResponse({ status: 401, description: 'Não autenticado' })
	async getMyOrientations(@Request() req: { user: { sub: number } }) {
		const userIdLogado = req.user.sub;
		return this.orientationsService.getMyOrientations(userIdLogado);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('TEACHER', 'COORDINATOR')
	@Patch(':id/status')
	@ApiOperation({ summary: 'Concluir ou cancelar uma orientação (RF014)' })
	@ApiParam({ name: 'id', type: Number })
	@ApiBody({ type: UpdateOrientationStatusDto })
	@ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
	@ApiResponse({ status: 400, description: 'Transição de status inválida' })
	@ApiResponse({ status: 401, description: 'Não autenticado' })
	@ApiResponse({ status: 403, description: 'Sem permissão sobre esta orientação' })
	@ApiResponse({ status: 404, description: 'Orientação não encontrada' })
	async updateStatus(
		@Request() req: { user: { sub: number; typeUser: string } },
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateOrientationStatusDto,
	) {
		return this.orientationsService.updateStatus(
			req.user.sub,
			req.user.typeUser,
			id,
			dto.status,
		);
	}
}
