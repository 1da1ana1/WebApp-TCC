import { Controller, Post, Request, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // Agora ele passa o 'body' diretamente para o authService,
    // que é onde devem estar o email e a senha que você enviou pelo Insomnia.
    return this.authService.login(body);
  }
}