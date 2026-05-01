import {
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
}
