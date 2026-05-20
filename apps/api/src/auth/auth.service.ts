import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
}
