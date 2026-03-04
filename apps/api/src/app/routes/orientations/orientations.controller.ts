import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { OrientationsService } from './orientations.service';

@Controller('orientations')
export class OrientationsController {
	constructor(private readonly orientationsService: OrientationsService) {}

	@UseGuards(JwtAuthGuard)
	@Get('my-orientations')
	async getMyOrientations(@Request() req: { user: { sub: number } }) {
		const userIdLogado = req.user.sub;
		return this.orientationsService.getMyOrientations(userIdLogado);
	}
}
