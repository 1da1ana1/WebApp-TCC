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
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { VacanciesService } from './vacancies.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Vacancies')
@ApiBearerAuth()
@Controller('vacancies')
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) {}

    // POST /vacancies/define — apenas coordenadores definem vagas (RF017)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('COORDINATOR')
    @Post('define')
    @ApiOperation({ summary: 'Definir vagas de um docente — apenas coordenador (RF017)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['quantity'],
            properties: {
                quantity: { type: 'integer', example: 3 },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Vaga criada com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado' })
    @ApiResponse({ status: 404, description: 'Semestre ativo ou coordenador não encontrado' })
    async defineVacancies(
        @Request() req: { user: { sub: number } },
        @Body('quantity', ParseIntPipe) quantity: number,
    ) {
        const userIdLogado = req.user.sub;
        return this.vacanciesService.defineVacancies(userIdLogado, quantity);
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
