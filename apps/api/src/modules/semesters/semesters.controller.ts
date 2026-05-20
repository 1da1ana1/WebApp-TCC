import {
	Body,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { SemestersService } from './semesters.service';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

@ApiTags('Semesters')
@ApiBearerAuth()
@Controller('semesters')
export class SemestersController {
	constructor(private readonly semestersService: SemestersService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('COORDINATOR')
	@Post()
	@ApiOperation({ summary: 'Criar semestre (coordenador)' })
	@ApiBody({ type: CreateSemesterDto })
	@ApiResponse({ status: 201, description: 'Semestre criado com sucesso' })
	@ApiResponse({ status: 401, description: 'Não autenticado' })
	@ApiResponse({ status: 403, description: 'Acesso negado' })
	async createSemester(
		@Request() req: { user: { sub: number } },
		@Body() data: CreateSemesterDto,
	) {
		const userIdLogado = req.user.sub;
		return this.semestersService.createSemester(userIdLogado, data);
	}

	@Get('active')
	@ApiOperation({ summary: 'Obter semestre ativo (público)' })
	@ApiResponse({ status: 200, description: 'Semestre ativo retornado com sucesso' })
	async getActiveSemester() {
		return this.semestersService.getActiveSemester();
	}
}
