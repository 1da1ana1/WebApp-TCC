import { Controller, Get, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { ReportsService } from './reports.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('TEACHER', 'COORDINATOR')
    @Get('teacher-stats')
    @ApiOperation({ summary: 'Obter estatísticas do docente logado' })
    @ApiQuery({ name: 'semesterId', required: false, type: Number, description: 'Filtra as estatísticas de orientações por semestre' })
    @ApiResponse({ status: 200, description: 'Estatísticas do docente retornadas com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado' })
    async getTeacherStats(
        @Request() req: { user: { sub: number } },
        @Query('semesterId') semesterId?: string,
    ) {
        const userIdLogado = req.user.sub;
        // Query params chegam como string; converte só quando numérico válido.
        const parsed = semesterId !== undefined ? Number(semesterId) : NaN;
        const semesterIdNum = Number.isInteger(parsed) ? parsed : undefined;
        return this.reportsService.getTeacherStats(userIdLogado, semesterIdNum);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('COORDINATOR')
    @Get('teacher-stats/:id')
    @ApiOperation({ summary: 'Obter estatísticas de um docente por userId (coordenador)' })
    @ApiParam({ name: 'id', type: Number, description: 'userId do docente alvo' })
    @ApiQuery({ name: 'semesterId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
    @ApiResponse({ status: 400, description: 'Usuário informado não é docente' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async getTeacherStatsById(
        @Param('id', ParseIntPipe) id: number,
        @Query('semesterId') semesterId?: string,
    ) {
        const parsed = semesterId !== undefined ? Number(semesterId) : NaN;
        const semesterIdNum = Number.isInteger(parsed) ? parsed : undefined;
        return this.reportsService.getTeacherStatsByUserId(id, semesterIdNum);
    }

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('COORDINATOR')
	@Get('coordinator-stats')
	@ApiOperation({ summary: 'Obter estatísticas gerais da coordenação' })
	@ApiResponse({ status: 200, description: 'Estatísticas da coordenação retornadas com sucesso' })
	@ApiResponse({ status: 401, description: 'Não autenticado' })
	@ApiResponse({ status: 403, description: 'Acesso negado' })
	async getCoordinatorStats(@Request() req: { user: { sub: number } }) {
		const userIdLogado = req.user.sub;
		return this.reportsService.getCoordinatorStats(userIdLogado);
	}
}
