import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService, SSO_UNAUTHORIZED_CODE } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../test/utils/prisma.mock';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  let jwt: { sign: jest.Mock };

  const baseUser = {
    id: 10,
    name: 'Carlos Docente',
    email: 'professor@unicamp.br',
    password: 'hashed',
    typeUser: 'TEACHER',
    student: null,
    teacher: { id: 99, userId: 10 },
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('signed.jwt.token');
  });

  describe('login', () => {
    it('lança UnauthorizedException quando email/senha ausentes', async () => {
      await expect(service.login({ email: '', password: '' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedException quando o usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@y.z', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lança UnauthorizedException quando a senha não confere', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: baseUser.email, password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('autentica, assina o JWT com o payload correto e retorna o usuário', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.activityLog.create.mockResolvedValue({} as never);

      const result = await service.login({
        email: baseUser.email,
        password: '123456',
      });

      expect(jwt.sign).toHaveBeenCalledWith({
        email: baseUser.email,
        sub: baseUser.id,
        typeUser: baseUser.typeUser,
      });
      expect(result).toEqual({
        access_token: 'signed.jwt.token',
        user: {
          id: 10,
          name: 'Carlos Docente',
          email: 'professor@unicamp.br',
          typeUser: 'TEACHER',
          teacherId: 99,
          studentId: null,
        },
      });
    });

    it('registra o LOGIN na auditoria (RF016)', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.activityLog.create.mockResolvedValue({} as never);

      await service.login({ email: baseUser.email, password: '123456' });

      expect(prisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 10, action: 'LOGIN' }),
        }),
      );
    });

    it('não derruba o login se a auditoria falhar (best-effort)', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.activityLog.create.mockRejectedValue(new Error('db down'));

      const result = await service.login({
        email: baseUser.email,
        password: '123456',
      });

      expect(result.access_token).toBe('signed.jwt.token');
    });
  });

  describe('ssoLogin (RF019)', () => {
    it('nega acesso quando o e-mail não está na whitelist (Cenário A)', async () => {
      prisma.whitelist.findUnique.mockResolvedValue(null);

      await expect(
        service.ssoLogin({ email: 'estranho@x.com' }),
      ).rejects.toThrow(SSO_UNAUTHORIZED_CODE);
      expect(prisma.user.upsert).not.toHaveBeenCalled();
    });

    it('nega acesso quando não há e-mail no payload', async () => {
      await expect(service.ssoLogin({ email: '' })).rejects.toThrow(
        SSO_UNAUTHORIZED_CODE,
      );
      expect(prisma.whitelist.findUnique).not.toHaveBeenCalled();
    });

    it('provisiona o usuário com a role da whitelist e assina o JWT (Cenário B)', async () => {
      prisma.whitelist.findUnique.mockResolvedValue({
        id: 1,
        email: 'aluno@ft.unicamp.br',
        role: 'STUDENT',
      } as never);
      prisma.user.upsert.mockResolvedValue({
        id: 42,
        name: 'Maria Aluna',
        email: 'aluno@ft.unicamp.br',
        typeUser: 'STUDENT',
        student: { id: 7 },
        teacher: null,
      } as never);
      prisma.activityLog.create.mockResolvedValue({} as never);

      const result = await service.ssoLogin({
        email: 'ALUNO@ft.unicamp.br', // normaliza para minúsculas
        name: 'Maria Aluna',
      });

      // Busca a whitelist pelo e-mail normalizado.
      expect(prisma.whitelist.findUnique).toHaveBeenCalledWith({
        where: { email: 'aluno@ft.unicamp.br' },
      });
      // Upsert cria com a role vinda da whitelist; update só mexe no nome.
      const upsertArg = prisma.user.upsert.mock.calls[0][0] as {
        where: { email: string };
        create: { typeUser: string };
        update: Record<string, unknown>;
      };
      expect(upsertArg.where).toEqual({ email: 'aluno@ft.unicamp.br' });
      expect(upsertArg.create.typeUser).toBe('STUDENT');
      expect(upsertArg.update).toEqual({ name: 'Maria Aluna' });
      expect('typeUser' in upsertArg.update).toBe(false); // role preservada

      expect(jwt.sign).toHaveBeenCalledWith({
        email: 'aluno@ft.unicamp.br',
        sub: 42,
        typeUser: 'STUDENT',
      });
      expect(result).toEqual({
        access_token: 'signed.jwt.token',
        user: {
          id: 42,
          name: 'Maria Aluna',
          email: 'aluno@ft.unicamp.br',
          typeUser: 'STUDENT',
          teacherId: null,
          studentId: 7,
        },
      });
    });
  });

  describe('logout', () => {
    it('calcula sessionDuration a partir do último LOGIN', async () => {
      const loginAt = new Date('2026-06-29T12:00:00.000Z');
      prisma.activityLog.findFirst.mockResolvedValue({
        id: 1,
        userId: 10,
        action: 'LOGIN',
        loginAt,
        createdAt: loginAt,
      } as never);
      prisma.activityLog.create.mockResolvedValue({} as never);

      await service.logout(10);

      const createArg = prisma.activityLog.create.mock.calls[0][0] as {
        data: { action: string; sessionDuration?: number };
      };
      expect(createArg.data.action).toBe('LOGOUT');
      expect(typeof createArg.data.sessionDuration).toBe('number');
      expect(createArg.data.sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('grava LOGOUT sem duração quando não há login anterior', async () => {
      prisma.activityLog.findFirst.mockResolvedValue(null);
      prisma.activityLog.create.mockResolvedValue({} as never);

      await service.logout(10);

      const createArg = prisma.activityLog.create.mock.calls[0][0] as {
        data: { action: string; sessionDuration?: number };
      };
      expect(createArg.data.action).toBe('LOGOUT');
      expect(createArg.data.sessionDuration).toBeUndefined();
    });
  });
});
