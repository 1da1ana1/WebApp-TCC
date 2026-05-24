import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { ListTeachersQueryDto } from './dto/list-teachers-query.dto';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar docentes',
    description:
      'Filtros opcionais via query: ?name=silva&keywords=Inteligência Artificial,Redes (AND).',
  })
  @ApiResponse({ status: 200, description: 'Lista de docentes retornada com sucesso' })
  async findAll(@Query() query: ListTeachersQueryDto) {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar docente por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Docente encontrado' })
  @ApiResponse({ status: 404, description: 'Docente não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }
}
