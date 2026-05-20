import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_METADATA_KEY, UserRole } from './roles.decorator';
import { RolesGuard } from './roles.guard';

/**
 * Constrói um `ExecutionContext` mínimo apontando para um `request.user`
 * arbitrário. Permite cobrir todos os caminhos do guard sem subir o Nest
 * inteiro: mantemos os testes rápidos e determinísticos.
 */
const buildContext = (user: unknown): ExecutionContext => {
  const request = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => ({}) as never,
    getClass: () => ({}) as never,
    // Os campos abaixo não são usados pelo guard, mas precisam existir
    // para satisfazer o tipo `ExecutionContext`.
    getType: () => 'http',
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({}) as never,
    switchToWs: () => ({}) as never,
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  /** Atalho: configura o que o decorator @Roles teria semeado. */
  const setRequiredRoles = (roles: UserRole[] | undefined) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  // ---------------------------------------------------------------------------
  // Comportamento sem decorator (fail-open intencional para uso global futuro)
  // ---------------------------------------------------------------------------
  describe('quando @Roles não está definido', () => {
    it('libera acesso para qualquer usuário (no-op)', () => {
      setRequiredRoles(undefined);
      const ctx = buildContext({ typeUser: 'STUDENT' });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('libera acesso quando a lista de papéis está vazia', () => {
      setRequiredRoles([]);
      const ctx = buildContext({ typeUser: 'STUDENT' });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Caminho feliz: usuário tem o papel requerido
  // ---------------------------------------------------------------------------
  describe('quando o papel exigido bate com request.user.typeUser', () => {
    it.each<UserRole>(['COORDINATOR', 'TEACHER', 'STUDENT'])(
      'libera acesso para %s',
      (role) => {
        setRequiredRoles([role]);
        const ctx = buildContext({ typeUser: role });
        expect(guard.canActivate(ctx)).toBe(true);
      },
    );

    it('aceita papel quando a rota declara múltiplos papéis (OR)', () => {
      setRequiredRoles(['COORDINATOR', 'TEACHER']);
      expect(guard.canActivate(buildContext({ typeUser: 'TEACHER' }))).toBe(true);
      expect(guard.canActivate(buildContext({ typeUser: 'COORDINATOR' }))).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Cenários negativos (403 Forbidden)
  // ---------------------------------------------------------------------------
  describe('quando o papel não é suficiente', () => {
    it('lança ForbiddenException para STUDENT em rota COORDINATOR-only', () => {
      setRequiredRoles(['COORDINATOR']);
      const ctx = buildContext({ typeUser: 'STUDENT' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('lança ForbiddenException para TEACHER em rota COORDINATOR-only', () => {
      setRequiredRoles(['COORDINATOR']);
      const ctx = buildContext({ typeUser: 'TEACHER' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('rejeita comparação não-estrita (case-sensitive: "coordinator" !== "COORDINATOR")', () => {
      setRequiredRoles(['COORDINATOR']);
      const ctx = buildContext({ typeUser: 'coordinator' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('rejeita usuário sem o campo typeUser', () => {
      setRequiredRoles(['COORDINATOR']);
      const ctx = buildContext({ sub: 1, email: 'x@y.z' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('rejeita typeUser arbitrário fora do enum (ex: "ADMIN")', () => {
      setRequiredRoles(['COORDINATOR']);
      const ctx = buildContext({ typeUser: 'ADMIN' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  // ---------------------------------------------------------------------------
  // Cenário 401: faltou o JwtAuthGuard antes do RolesGuard
  // ---------------------------------------------------------------------------
  describe('quando request.user está ausente', () => {
    it('lança UnauthorizedException (sinaliza pipeline mal montado)', () => {
      setRequiredRoles(['COORDINATOR']);
      const ctx = buildContext(undefined);
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });
  });

  // ---------------------------------------------------------------------------
  // Contrato com o decorator
  // ---------------------------------------------------------------------------
  describe('integração com o Reflector', () => {
    it('lê metadata sob a chave exportada por roles.decorator', () => {
      const spy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['COORDINATOR']);

      const ctx = buildContext({ typeUser: 'COORDINATOR' });
      guard.canActivate(ctx);

      expect(spy).toHaveBeenCalledWith(ROLES_METADATA_KEY, expect.any(Array));
    });
  });
});
