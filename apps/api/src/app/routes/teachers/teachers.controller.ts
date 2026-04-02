import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar docentes' })
  @ApiResponse({ status: 200, description: 'Lista de docentes retornada com sucesso' })
  async findAll() {
    return this.teachersService.findAll();
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
