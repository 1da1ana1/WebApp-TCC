import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles('TEACHER', 'COORDINATOR')
  @ApiOperation({ summary: 'Listar alunos (resumo: id, name, ra, keywords)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a TEACHER/COORDINATOR' })
  findAll() {
    return this.studentsService.findAll();
  }

  // `/me` precisa vir antes de `/:id` — sem isso, Nest casa "me" como
  // parâmetro e o ParseIntPipe estoura antes mesmo de chegar no RolesGuard.
  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Perfil completo do aluno autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a STUDENT' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  findMe(@Req() req: { user: { sub: number } }) {
    return this.studentsService.findMe(req.user.sub);
  }

  @Get(':id')
  @Roles('TEACHER', 'COORDINATOR')
  @ApiOperation({ summary: 'Perfil read-only de um aluno específico' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Perfil retornado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a TEACHER/COORDINATOR' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }
}