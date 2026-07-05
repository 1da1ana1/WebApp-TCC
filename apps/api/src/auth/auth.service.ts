import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Código de erro devolvido quando o e-mail autenticado pelo SSO NÃO está na
 * whitelist (RF019 — Cenário A). O controller usa este código para redirecionar
 * ao login com `?error=unauthorized_bsi`.
 */
export const SSO_UNAUTHORIZED_CODE = 'unauthorized_bsi';

/**
 * Sentinela gravada em `User.password` para usuários provisionados via SSO.
 * Não é um hash bcrypt válido, então o login local (`/auth/login`) nunca
 * autentica com ele — o acesso desses usuários é exclusivamente via SSO.
 */
const SSO_NO_LOCAL_PASSWORD = '!sso-no-local-login!';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * RF019 — Login via SSO com acesso restrito pela whitelist.
   *
   * Fluxo:
   *  1. Busca o e-mail autenticado na `Whitelist` (findUnique).
   *  2. Cenário A — não encontrado: aborta com `UnauthorizedException`
   *     carregando `SSO_UNAUTHORIZED_CODE` (o controller vira isso em
   *     redirect `?error=unauthorized_bsi`).
   *  3. Cenário B — encontrado: `upsert` do `User` pelo e-mail. Na criação,
   *     a role vem da whitelist; no update, só dados voláteis (nome) são
   *     tocados e a role atual é PRESERVADA (nunca rebaixamos/elevamos um
   *     usuário existente com base na whitelist).
   *  4. Assina o JWT com { email, sub, typeUser } — mesmo payload do login local.
   */
  async ssoLogin(profile: { email: string; name?: string }) {
    const email = profile?.email?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException(SSO_UNAUTHORIZED_CODE);
    }

    // 1 + 2. Validação da whitelist.
    const allowed = await this.prisma.whitelist.findUnique({ where: { email } });
    if (!allowed) {
      throw new UnauthorizedException(SSO_UNAUTHORIZED_CODE);
    }

    // 3. Upsert do usuário. `allowed.role` é o enum WhitelistRole ('STUDENT'
    //    | 'TEACHER'), cujo valor string bate 1:1 com `User.typeUser`.
    const name = profile.name?.trim() || email.split('@')[0];
    const user = await this.prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        password: SSO_NO_LOCAL_PASSWORD,
        typeUser: allowed.role,
      },
      // Mantém a role atual — atualiza apenas dados cadastrais voláteis.
      update: { name },
      include: { student: true, teacher: true },
    });

    // Auditoria (RF016), best-effort — não derruba o login se falhar.
    try {
      await this.prisma.activityLog.create({
        data: { userId: user.id, action: 'LOGIN', loginAt: new Date() },
      });
    } catch {
      // ignora — logging é best-effort
    }

    const payload = { email: user.email, sub: user.id, typeUser: user.typeUser };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        typeUser: user.typeUser,
        teacherId: user.teacher?.id ?? null,
        studentId: user.student?.id ?? null,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { student: true, teacher: true },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // No arquivo auth.service.ts
  async login(user: any) {
    if (!user?.email || !user?.password) {
      throw new UnauthorizedException('Email e senha são obrigatórios.');
    }

    const validatedUser = await this.validateUser(user.email, user.password);
    if (!validatedUser) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = {
      email: validatedUser.email,
      sub: validatedUser.id,
      typeUser: validatedUser.typeUser,
    };

    // Auditoria de login (RF016). Falha ao registrar não deve impedir o login.
    try {
      await this.prisma.activityLog.create({
        data: { userId: validatedUser.id, action: 'LOGIN', loginAt: new Date() },
      });
    } catch {
      // ignora — logging é best-effort
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: validatedUser.id,
        name: validatedUser.name,
        email: validatedUser.email,
        typeUser: validatedUser.typeUser,
        teacherId: validatedUser.teacher?.id ?? null,
        studentId: validatedUser.student?.id ?? null,
      },
    };
  }

  /**
   * Registra o LOGOUT do usuário e calcula a duração da sessão (em segundos)
   * a partir do último LOGIN. Idempotente o suficiente para o front chamar
   * ao sair; se não houver login anterior, grava sem duração.
   */
  async logout(userId: number) {
    const lastLogin = await this.prisma.activityLog.findFirst({
      where: { userId, action: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const start = lastLogin?.loginAt ?? lastLogin?.createdAt ?? null;
    const sessionDuration = start
      ? Math.max(0, Math.round((now.getTime() - new Date(start).getTime()) / 1000))
      : undefined;

    return this.prisma.activityLog.create({
      data: { userId, action: 'LOGOUT', logoutAt: now, sessionDuration },
    });
  }
}
