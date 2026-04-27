import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OrientationsService } from './orientations.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
