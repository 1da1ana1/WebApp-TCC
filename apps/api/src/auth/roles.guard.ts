import {
<<<<<<< HEAD
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_METADATA_KEY, UserRole } from './roles.decorator';

/**
 * `RolesGuard`
 *
 * Autorização baseada em papéis para endpoints já autenticados via
 * `JwtAuthGuard`. Lê os papéis exigidos a partir do metadata semeado
 * pelo decorator `@Roles(...)` e compara contra `request.user.typeUser`
 * (anexado pelo `JwtStrategy.validate()`).
 *
 * Comportamento:
 *  - Sem `@Roles(...)` no handler/controller → guard é no-op (libera).
 *    Isso permite usar o guard globalmente no futuro sem impactar
 *    rotas que não definem restrição de papel.
 *  - Sem `request.user` → 401 Unauthorized. Indica falta do
 *    `JwtAuthGuard` antes deste guard, ou JWT inválido.
 *  - `typeUser` não está nos papéis exigidos → 403 Forbidden.
 *
 * Importante: a comparação é estrita ("COORDINATOR" !== "coordinator"),
 * porque os valores no JWT vêm direto da coluna `User.typeUser` do
 * Prisma, sempre em maiúsculo. Manter o contrato 1:1 evita
 * normalizações implícitas que poderiam mascarar bugs.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Resolve os papéis exigidos. `getAllAndOverride` permite que um
    //    @Roles em um handler específico sobrescreva o do controller.
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Sem decorator: nada a autorizar — fica como JwtAuthGuard sozinho.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Recupera o usuário anexado pelo JwtAuthGuard/JwtStrategy.
    const request = context.switchToHttp().getRequest();
    const user = request.user as { typeUser?: string } | undefined;

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não autenticado. Garanta que o JwtAuthGuard execute antes do RolesGuard.',
      );
    }

    // 3. Verifica se o papel do usuário está entre os permitidos.
    const userRole = user.typeUser;
    if (!userRole || !requiredRoles.includes(userRole as UserRole)) {
      throw new ForbiddenException(
        `Acesso restrito. Esta rota exige um dos papéis: ${requiredRoles.join(', ')}.`,
      );
    }

    return true;
  }
=======
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * RolesGuard
 *
 * Guard que lê os perfis exigidos pela rota (definidos via @Roles())
 * e verifica se o usuário autenticado possui um desses perfis.
 *
 * IMPORTANTE: Este guard deve ser sempre usado DEPOIS do JwtAuthGuard,
 * pois depende do request.user que o JwtAuthGuard popula.
 *
 * Fluxo de verificação:
 *   1. Lê as roles exigidas pela rota via Reflector.
 *   2. Se a rota não tiver @Roles(), permite o acesso (rota pública para qualquer logado).
 *   3. Se tiver, verifica se request.user.typeUser está na lista de roles permitidas.
 *   4. Se não estiver, lança ForbiddenException (HTTP 403).
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.typeUser) {
            throw new ForbiddenException('Acesso negado: perfil de usuário não identificado.');
        }

        const hasPermission = requiredRoles.includes(user.typeUser);

        if (!hasPermission) {
            throw new ForbiddenException(
                `Acesso negado: esta rota requer o perfil ${requiredRoles.join(' ou ')}.`,
            );
        }

        return true;
    }
>>>>>>> 0b4299032dd50b96ab1a81f3b9aa43c99ee3b03f
}
