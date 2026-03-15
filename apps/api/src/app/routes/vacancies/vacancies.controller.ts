import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
	constructor(private readonly vacanciesService: VacanciesService) {}

	@UseGuards(JwtAuthGuard)
	@Post('define')
	async defineVacancies(
		@Request() req: { user: { sub: number } },
		@Body('quantity', ParseIntPipe) quantity: number,
	) {
		const userIdLogado = req.user.sub;
		return this.vacanciesService.defineVacancies(userIdLogado, quantity);
	}

	@UseGuards(JwtAuthGuard)
	@Get('teacher/:id')
	async getTeacherVacancies(@Param('id', ParseIntPipe) teacherId: number) {
		return this.vacanciesService.getTeacherVacancies(teacherId);
	}
}
