import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Mock tipado e profundo do `PrismaService`, reutilizável em qualquer teste
 * unitário de service. Cada método de cada model (`user.findUnique`,
 * `request.create`, `$transaction`, ...) já vem como `jest.fn()` com a
 * assinatura correta — o TypeScript reclama se você mockar um retorno do
 * tipo errado.
 *
 * Uso:
 *   const prisma = createPrismaMock();
 *   const module = await Test.createTestingModule({
 *     providers: [
 *       MeuService,
 *       { provide: PrismaService, useValue: prisma },
 *     ],
 *   }).compile();
 *   prisma.user.findUnique.mockResolvedValue(...);
 */
export type PrismaMock = DeepMockProxy<PrismaService>;

export const createPrismaMock = (): PrismaMock => mockDeep<PrismaService>();

/** Limpa todos os mocks acumulados (chamar no `beforeEach`/`afterEach`). */
export const resetPrismaMock = (mock: PrismaMock) => mockReset(mock);

/**
 * Helper para `$transaction(async (tx) => ...)`: faz o callback rodar com o
 * próprio mock como `tx`, de modo que `tx.contestation.update(...)` etc. usem
 * os mesmos `jest.fn()` que você configurou no mock principal.
 */
export const runTransactionWithMock = (prisma: PrismaMock) => {
  prisma.$transaction.mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (arg: any) =>
      typeof arg === 'function' ? Promise.resolve(arg(prisma)) : Promise.all(arg),
  );
};
