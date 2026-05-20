import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
<<<<<<< HEAD
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
=======
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
>>>>>>> 0b4299032dd50b96ab1a81f3b9aa43c99ee3b03f
import { ReportsService } from './reports.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('TEACHER', 'COORDINATOR')
    @Get('teacher-stats')
    @ApiOperation({ summary: 'Obter estatísticas do docente logado' })
    @ApiResponse({ status: 200, description: 'Estatísticas do docente retornadas com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado' })
    async getTeacherStats(@Request() req: { user: { sub: number } }) {
        const userIdLogado = req.user.sub;
        return this.reportsService.getTeacherStats(userIdLogado);
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 0b4299032dd50b96ab1a81f3b9aa43c99ee3b03f
}
