import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { buildValidationPipe } from '../../src/common/validation';
import { LogsInterceptor } from '../../src/modules/logs/logs.interceptor';

export interface E2EContext {
  app: INestApplication;
  prisma: PrismaService;
}

/**
 * Sobe a aplicação Nest real para testes e2e, com dois ajustes que tornam a
 * suíte determinística e isolada:
 *
 *  1. **Mesmo ValidationPipe da produção** (`buildValidationPipe`) — o teste
 *     valida exatamente como o app em runtime.
 *  2. **`LogsInterceptor` neutralizado** — o interceptor global grava no banco
 *     a cada request; num teste isso polui dados e acopla cada caso à
 *     persistência. Aqui ele vira um passthrough.
 *
 * Reaproveita o `PrismaService` do próprio container (via `app.get`), evitando
 * uma segunda conexão paralela e mantendo um único ponto de verdade para o
 * setup/cleanup dos dados.
 */
export async function createE2EApp(): Promise<E2EContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LogsInterceptor)
    .useValue({ intercept: (_ctx: unknown, next: { handle: () => unknown }) => next.handle() })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(buildValidationPipe());
  await app.init();

  const prisma = app.get(PrismaService);
  return { app, prisma };
}
