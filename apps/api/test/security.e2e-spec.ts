import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../prisma/prisma.service';
import { createE2EApp } from './utils/e2e-app';

/**
 * Testes BÁSICOS de segurança. Objetivo central: a aplicação responde de forma
 * controlada (4xx) e NUNCA estoura erro interno (5xx) diante de entradas
 * hostis — SQL injection, XSS, payloads inesperados, headers inválidos, body
 * gigante, parâmetros maliciosos e tentativas de burlar autenticação/autorização.
 */
describe('Segurança (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let server: App;

  const suffix = Date.now();
  const password = '123456';
  const studentEmail = `sec.student.${suffix}@unicamp.br`;

  let studentToken: string;
  let studentUserId = 0;
  let xssTeacherUserId = 0;
  let teacherId = 0;

  const XSS = `<script>alert('xss-${suffix}')</script>`;

  // Tokens forjados (atacante NÃO conhece o segredo real do app).
  let forgedWrongSecret: string;
  let forgedAlgNone: string;

  /** Garante que a resposta é client-error controlada (nunca 5xx). */
  const expectNo500 = (status: number) => {
    expect(status).toBeLessThan(500);
  };

  beforeAll(async () => {
    ({ app, prisma } = await createE2EApp());
    server = app.getHttpServer();

    const hash = await bcrypt.hash(password, 10);

    const studentUser = await prisma.user.create({
      data: { name: 'Aluno Seguro', email: studentEmail, password: hash, typeUser: 'STUDENT' },
    });
    studentUserId = studentUser.id;
    await prisma.student.create({ data: { userId: studentUser.id, ra: `S${suffix}` } });

    // Docente cujo NOME carrega um payload XSS — para validar round-trip seguro.
    const xssTeacherUser = await prisma.user.create({
      data: { name: XSS, email: `sec.xss.${suffix}@unicamp.br`, password: hash, typeUser: 'TEACHER' },
    });
    xssTeacherUserId = xssTeacherUser.id;
    const teacher = await prisma.teacher.create({ data: { userId: xssTeacherUser.id } });
    teacherId = teacher.id;

    const res = await request(server)
      .post('/auth/login')
      .send({ email: studentEmail, password })
      .expect(201);
    studentToken = res.body.access_token;

    forgedWrongSecret = new JwtService({
      secret: 'segredo-do-atacante',
      signOptions: { expiresIn: '1h' },
    }).sign({ sub: 1, email: 'attacker@evil.com', typeUser: 'COORDINATOR' });

    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    forgedAlgNone =
      `${b64({ alg: 'none', typ: 'JWT' })}.` +
      `${b64({ sub: 1, email: 'attacker@evil.com', typeUser: 'COORDINATOR' })}.`;
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany({ where: { userId: { in: [studentUserId] } } });
    await prisma.teacher.deleteMany({ where: { id: teacherId } });
    await prisma.student.deleteMany({ where: { userId: studentUserId } });
    await prisma.user.deleteMany({ where: { id: { in: [studentUserId, xssTeacherUserId] } } });
    await app.close();
  });

  // ───────────────────────────── SQL Injection ──────────────────────────
  describe('SQL Injection', () => {
    it('login com payload de injeção não autentica e não quebra (sem 5xx)', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: "' OR 1=1 --", password: "' OR '1'='1" });
      expectNo500(res.status);
      expect([400, 401]).toContain(res.status); // validação ou credenciais inválidas
      expect(res.body.access_token).toBeUndefined();
    });

    it('busca de docentes com injeção é parametrizada (200) e o banco fica íntegro', async () => {
      const res = await request(server)
        .get('/teachers')
        .query({ name: `'; DROP TABLE "User"; --` });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Prova de que nada foi destruído: o usuário semeado continua lá.
      const stillThere = await prisma.user.findUnique({ where: { id: studentUserId } });
      expect(stillThere).not.toBeNull();
    });

    it('injeção via keywords não derruba a query (sem 5xx)', async () => {
      const res = await request(server)
        .get('/teachers')
        .query({ keywords: `x' OR '1'='1` });
      expectNo500(res.status);
      expect(res.status).toBe(200);
    });
  });

  // ───────────────────────────────── XSS ────────────────────────────────
  describe('XSS', () => {
    it('payload XSS armazenado faz round-trip como DADO inerte (sem execução, sem 5xx)', async () => {
      const res = await request(server).get('/teachers').query({ name: XSS });
      expect(res.status).toBe(200);
      const found = res.body.find((t: { user?: { name?: string } }) => t.user?.name === XSS);
      // A API devolve o texto literal (o escaping é responsabilidade do front).
      expect(found).toBeDefined();
      expect(found.user.name).toBe(XSS);
    });

    it('payload XSS no login é tratado como string inválida (sem 5xx)', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: XSS, password: XSS });
      expectNo500(res.status);
      expect([400, 401]).toContain(res.status);
    });
  });

  // ─────────────────────────── Payloads inesperados ─────────────────────
  describe('Payloads inesperados', () => {
    it('body como array (em vez de objeto) → 4xx, sem 5xx', async () => {
      const res = await request(server).post('/auth/login').send([1, 2, 3] as never);
      expectNo500(res.status);
      expect(res.status).toBe(400);
    });

    it('tentativa de prototype pollution não polui Object.prototype', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'a@b.com', password: 'x', __proto__: { polluted: true } } as never);
      expectNo500(res.status);
      // Nada deve ter sido injetado no protótipo global.
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('campos extras inesperados são ignorados/rejeitados (sem 5xx)', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'a@b.com', password: 'x', isAdmin: true, role: 'COORDINATOR', extra: { a: 1 } });
      expectNo500(res.status);
      expect([400, 401]).toContain(res.status);
    });
  });

  // ───────────────────────────── Headers inválidos ──────────────────────
  describe('Headers inválidos', () => {
    it('Content-Type text/plain com corpo JSON → 4xx, sem 5xx', async () => {
      const res = await request(server)
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send(JSON.stringify({ email: 'a@b.com', password: 'x' }));
      expectNo500(res.status);
      expect([400, 401, 415]).toContain(res.status);
    });

    it('Authorization malformado em rota protegida → 401', async () => {
      const res = await request(server)
        .get('/notifications/me')
        .set('Authorization', 'isto-nao-e-um-token');
      expect(res.status).toBe(401);
    });

    it('header Accept absurdo não quebra a resposta (sem 5xx)', async () => {
      const res = await request(server)
        .get('/teachers')
        .set('Accept', '*/*; q=not-a-number, application/💥');
      expectNo500(res.status);
    });
  });

  // ─────────────────────────── Body extremamente grande ─────────────────
  describe('Body extremamente grande', () => {
    it('payload de ~1MB é rejeitado (413), nunca 5xx', async () => {
      const huge = 'a'.repeat(1024 * 1024); // 1 MB > limite padrão (100kb)
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'a@b.com', password: huge });
      expectNo500(res.status);
      expect(res.status).toBe(413);
    });
  });

  // ──────────────────────────── Parâmetros maliciosos ───────────────────
  describe('Parâmetros maliciosos', () => {
    it('GET /teachers/:id com id não-numérico não gera 5xx', async () => {
      const res = await request(server).get('/teachers/abc');
      expectNo500(res.status);
    });

    it('GET /teachers/:id com número gigante (overflow) não gera 5xx', async () => {
      const res = await request(server).get('/teachers/999999999999999999999');
      expectNo500(res.status);
    });

    it('param numérico com injeção em rota protegida → 400 (ParseIntPipe)', async () => {
      const res = await request(server)
        .patch('/notifications/1%20OR%201=1/read')
        .set('Authorization', `Bearer ${studentToken}`);
      expectNo500(res.status);
      expect(res.status).toBe(400);
    });

    it('confusão de tipo em query (name como array) → 400, sem 5xx', async () => {
      const res = await request(server).get('/teachers').query({ 'name[]': 'x' });
      expectNo500(res.status);
      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────── Tentativas de burlar autenticação ────────────
  describe('Burlar autenticação/autorização', () => {
    it('rota protegida sem token → 401', async () => {
      await request(server).get('/notifications/me').expect(401);
    });

    it('token forjado com segredo errado → 401 (assinatura inválida)', async () => {
      const res = await request(server)
        .get('/notifications/me')
        .set('Authorization', `Bearer ${forgedWrongSecret}`);
      expect(res.status).toBe(401);
    });

    it('token forjado com alg:none → 401 (rejeita algoritmo inseguro)', async () => {
      const res = await request(server)
        .get('/notifications/me')
        .set('Authorization', `Bearer ${forgedAlgNone}`);
      expect(res.status).toBe(401);
    });

    it('escalonamento de privilégio: STUDENT em rota COORDINATOR → 403', async () => {
      const res = await request(server)
        .post('/vacancies/define')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId, quantity: 3 });
      expectNo500(res.status);
      expect(res.status).toBe(403);
    });
  });
});
