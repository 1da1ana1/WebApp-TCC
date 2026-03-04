import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@UseGuards(JwtAuthGuard)
	@Get('teacher-stats')
	async getTeacherStats(@Request() req: { user: { sub: number } }) {
		const userIdLogado = req.user.sub;
		return this.reportsService.getTeacherStats(userIdLogado);
	}
}
