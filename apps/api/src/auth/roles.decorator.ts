import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator @Roles()
 *
 * Marca uma rota com os perfis de usuário que têm permissão de acesso.
 * Deve ser usado em conjunto com o RolesGuard.
 *
 * Exemplo de uso em um Controller:
 *   @Roles('COORDINATOR')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('rota-restrita')
 *   minhaRota() { ... }
 *
 * Os valores válidos são os mesmos definidos no enum TypeUser do Prisma:
 *   'STUDENT' | 'TEACHER' | 'COORDINATOR'
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
