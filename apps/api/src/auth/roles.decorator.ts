import { SetMetadata } from '@nestjs/common';

<<<<<<< HEAD
/**
 * Tipos de usuário válidos no sistema.
 * Espelha exatamente os valores armazenados na coluna `User.typeUser` do
 * schema Prisma — não normalizamos para minúsculo aqui propositalmente:
 * o JWT carrega o valor canônico em maiúsculo, e a comparação no
 * `RolesGuard` deve bater 1:1 com o que o backend persistiu.
 */
export type UserRole = 'COORDINATOR' | 'TEACHER' | 'STUDENT';

/**
 * Chave usada para anexar/ler os papéis exigidos via `Reflector`.
 * Exportada para que o guard (e eventuais testes) referenciem o mesmo
 * símbolo, evitando "magic strings" duplicadas pelo código.
 */
export const ROLES_METADATA_KEY = 'roles';

/**
 * Decorator de autorização. Aceita um ou mais papéis e marca o handler
 * (ou controller inteiro) como restrito a esses papéis. O efeito real
 * acontece quando combinado com o `RolesGuard`.
 *
 * @example
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('COORDINATOR')
 *   @Post()
 *   createSemester(...) { ... }
 *
 * @example  Aceita múltiplos papéis (OR lógico):
 *   @Roles('COORDINATOR', 'TEACHER')
 */
export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles);
=======
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
>>>>>>> 0b4299032dd50b96ab1a81f3b9aa43c99ee3b03f
