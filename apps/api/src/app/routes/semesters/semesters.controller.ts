import {
	Body,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { SemestersService } from './semesters.service';

@Controller('semesters')
export class SemestersController {
	constructor(private readonly semestersService: SemestersService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createSemester(
		@Request() req: { user: { sub: number } },
		@Body() data: CreateSemesterDto,
	) {
		const userIdLogado = req.user.sub;
		return this.semestersService.createSemester(userIdLogado, data);
	}

	@UseGuards(JwtAuthGuard)
	@Get('active')
	async getActiveSemester() {
		return this.semestersService.getActiveSemester();
	}
}
