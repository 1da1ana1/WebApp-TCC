import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teachers')
export class TeachersController {
  // Injeta o Service para podermos usá-lo
  constructor(private readonly teachersService: TeachersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    // Chama a função findAll() que criamos no Service acima
    return this.teachersService.findAll();
  }
}