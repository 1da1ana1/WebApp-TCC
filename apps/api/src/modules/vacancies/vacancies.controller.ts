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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { VacanciesService } from './vacancies.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { DefineVacanciesDto } from './dto/define-vacancies.dto';

@ApiTags('Vacancies')
@ApiBearerAuth()
@Controller('vacancies')
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('COORDINATOR')
	@Post('define')
	@ApiOperation({
		summary:
			'Coordenador define a quantidade de vagas de um docente em um semestre',
	})
	@ApiBody({ type: DefineVacanciesDto })
	@ApiResponse({
		status: 201,
		description: 'Vaga criada ou atualizada com sucesso',
	})
	@ApiResponse({ status: 400, description: 'Erro de validação no body' })
	@ApiResponse({ status: 401, description: 'Não autenticado' })
	@ApiResponse({
		status: 403,
		description: 'Apenas coordenadores podem definir vagas',
	})
	@ApiResponse({
		status: 404,
		description: 'Docente, semestre ou coordenador não encontrado',
	})
	async defineVacancies(
		@Request() req: { user: { sub: number } },
		@Body() dto: DefineVacanciesDto,
	) {
		const userIdLogado = req.user.sub;
		return this.vacanciesService.defineVacancies(userIdLogado, dto);
	}

    // GET /vacancies/teacher/:id — professores e coordenação podem consultar
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('TEACHER', 'COORDINATOR')
    @Get('teacher/:id')
    @ApiOperation({ summary: 'Listar vagas por docente' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Vagas retornadas com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async getTeacherVacancies(@Param('id', ParseIntPipe) teacherId: number) {
        return this.vacanciesService.getTeacherVacancies(teacherId);
    }
}
