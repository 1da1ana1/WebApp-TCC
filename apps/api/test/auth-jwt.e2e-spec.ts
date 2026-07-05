import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2EApp } from './utils/e2e-app';

/**
 * Testes do JwtAuthGuard a nível HTTP — apenas autenticação, sem regras de
 * negócio. Usamos GET /notifications/me por ser uma rota protegida SÓ pelo
 * JwtAuthGuard (sem RolesGuard) que não depende de dados: devolve [] para
 * qualquer `sub`. Assim, o único fator entre 200 e 401 é a validade do token.
 *
 * Os tokens são assinados com o mesmo JwtService (e secret) da aplicação,
 * permitindo controlar expiração e adulteração de forma determinística.
 */
describe('JWT Auth (e2e)', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;

  const PROTECTED = '/notifications/me';
  const payload = { sub: 1, email: 'jwt@test.com', typeUser: 'STUDENT' };

  /** Token bem-formado e assinado com o secret do app. */
  const validToken = () => jwt.sign(payload);

  beforeAll(async () => {
    ({ app } = await createE2EApp());
    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('token válido → 200', async () => {
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', `Bearer ${validToken()}`)
      .expect(200);
  });

  it('token ausente (sem header Authorization) → 401', async () => {
    await request(app.getHttpServer()).get(PROTECTED).expect(401);
  });

  it('token expirado → 401', async () => {
    const expired = jwt.sign(payload, { expiresIn: -10 }); // exp no passado
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });

  it('token alterado (assinatura adulterada) → 401', async () => {
    const token = validToken();
    // Inverte o último caractere → assinatura não confere.
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', `Bearer ${tampered}`)
      .expect(401);
  });

  it('esquema incorreto (Basic em vez de Bearer) → 401', async () => {
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', `Basic ${validToken()}`)
      .expect(401);
  });

  it('Authorization vazio → 401', async () => {
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', '')
      .expect(401);
  });

  it('Authorization malformado (Bearer sem token) → 401', async () => {
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', 'Bearer')
      .expect(401);
  });

  it('Authorization malformado (token sem o esquema Bearer) → 401', async () => {
    await request(app.getHttpServer())
      .get(PROTECTED)
      .set('Authorization', validToken())
      .expect(401);
  });
});
