import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, SSO_UNAUTHORIZED_CODE } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SsoCallbackDto } from './dto/sso-callback.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Base do frontend para os redirects do SSO. Configurável por env em produção
 * (onde front e API vivem em hosts diferentes); default para o Vite dev server.
 */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Autenticação realizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  /**
   * RF019 — Callback do SSO. Recebe o payload de sucesso do provedor
   * (aqui, e-mail/nome via query) e:
   *   - Cenário A (fora da whitelist): redireciona ao login com
   *     `?error=unauthorized_bsi`.
   *   - Cenário B (autorizado): provisiona/atualiza o usuário, gera o JWT e
   *     redireciona ao frontend com o token para finalizar a sessão.
   */
  @Get('sso/callback')
  @ApiOperation({ summary: 'Callback do SSO com validação de whitelist (RF019)' })
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiResponse({ status: 302, description: 'Redireciona ao dashboard (sucesso) ou ao login (?error)' })
  async ssoCallback(@Query() query: SsoCallbackDto, @Res() res: Response) {
    try {
      const { access_token } = await this.authService.ssoLogin(query);
      // Entrega o token ao SPA, que o consome e roteia conforme a role.
      const target = new URL('/dev-login', FRONTEND_URL);
      target.searchParams.set('sso_token', access_token);
      return res.redirect(target.toString());
    } catch {
      // Qualquer falha de autorização vira o Cenário A (acesso negado).
      const target = new URL('/dev-login', FRONTEND_URL);
      target.searchParams.set('error', SSO_UNAUTHORIZED_CODE);
      return res.redirect(target.toString());
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar logout e calcular duração da sessão' })
  @ApiResponse({ status: 201, description: 'Logout registrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async logout(@Request() req: { user: { sub: number } }) {
    return this.authService.logout(req.user.sub);
  }
}