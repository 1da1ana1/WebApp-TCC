import {
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
}
