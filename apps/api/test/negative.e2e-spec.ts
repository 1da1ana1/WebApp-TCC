import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../prisma/prisma.service';
import { createE2EApp } from './utils/e2e-app';

/**
 * Testes NEGATIVOS dos endpoints. Para cada um, cobrimos (quando aplicável):
 * campo obrigatório ausente, body vazio, campo inválido, tipo incorreto,
 * ID inexistente, ID inválido, JSON malformado e método HTTP incorreto.
 *
 * Contrato verificado:
 *  - Erros de validação de body  → 400 (ValidationPipe global)
 *  - Param de ID não-numérico    → 400 (ParseIntPipe)
 *  - JSON malformado             → 400 (body-parser)
 *  - Recurso inexistente         → 404 (NotFoundException dos services)
 *  - Método HTTP não mapeado     → 404 (rota não casada)
 *  - NUNCA 500 (erro de servidor) — todo status é client error (< 500).
 *
 * As rotas protegidas usam token do papel correto para ULTRAPASSAR os guards
 * e chegar na camada de validação/negócio (senão o teste pararia em 401/403).
 */
describe('Endpoints — testes negativos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const suffix = Date.now();
  const password = '123456';
  const NOPE = 999999; // id que não existe

  type Authed = ReturnType<typeof makeAuthed>;
  let asCoordinator: Authed;
  let asTeacher: Authed;
  let asStudent: Authed;

  function makeAuthed(token: string) {
    const server = app.getHttpServer();
    const auth = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
    return {
      get: (url: string) => auth(request(server).get(url)),
      post: (url: string) => auth(request(server).post(url)),
      patch: (url: string) => auth(request(server).patch(url)),
      put: (url: string) => auth(request(server).put(url)),
      delete: (url: string) => auth(request(server).delete(url)),
    };
  }

  /** Envia corpo JSON sintaticamente inválido (raw). */
  const malformed = (r: request.Test) =>
    r.set('Content-Type', 'application/json').send('{"campo": ');

  const ids = {
    coordinatorUserId: 0,
    coordinatorTeacherId: 0,
    teacherUserId: 0,
    teacherId: 0,
    studentUserId: 0,
    studentId: 0,
  };

  const coordinatorEmail = `n.coord.${suffix}@unicamp.br`;
  const teacherEmail = `n.teacher.${suffix}@unicamp.br`;
  const studentEmail = `n.student.${suffix}@unicamp.br`;

  async function login(email: string) {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    return res.body.access_token as string;
  }

  beforeAll(async () => {
    ({ app, prisma } = await createE2EApp());
    const hash = await bcrypt.hash(password, 10);

    const coordUser = await prisma.user.create({
      data: { name: 'Coord Neg', email: coordinatorEmail, password: hash, typeUser: 'COORDINATOR' },
    });
    ids.coordinatorUserId = coordUser.id;
    const coordTeacher = await prisma.teacher.create({
      data: { userId: coordUser.id, isCoordinator: true },
    });
    ids.coordinatorTeacherId = coordTeacher.id;
    await prisma.coordinator.create({ data: { teacherId: coordTeacher.id } });

    const teacherUser = await prisma.user.create({
      data: { name: 'Teacher Neg', email: teacherEmail, password: hash, typeUser: 'TEACHER' },
    });
    ids.teacherUserId = teacherUser.id;
    const teacher = await prisma.teacher.create({ data: { userId: teacherUser.id } });
    ids.teacherId = teacher.id;

    const studentUser = await prisma.user.create({
      data: { name: 'Student Neg', email: studentEmail, password: hash, typeUser: 'STUDENT' },
    });
    ids.studentUserId = studentUser.id;
    const student = await prisma.student.create({
      data: { userId: studentUser.id, ra: `N${suffix}` },
    });
    ids.studentId = student.id;

    asCoordinator = makeAuthed(await login(coordinatorEmail));
    asTeacher = makeAuthed(await login(teacherEmail));
    asStudent = makeAuthed(await login(studentEmail));
  });

  afterAll(async () => {
    const userIds = [ids.coordinatorUserId, ids.teacherUserId, ids.studentUserId];
    await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.coordinator.deleteMany({ where: { teacherId: ids.coordinatorTeacherId } });
    await prisma.student.deleteMany({ where: { id: ids.studentId } });
    await prisma.teacher.deleteMany({
      where: { id: { in: [ids.coordinatorTeacherId, ids.teacherId] } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  // ───────────────────────── POST /auth/login (público) ─────────────────
  describe('POST /auth/login', () => {
    const server = () => app.getHttpServer();

    it('body vazio → 400', () =>
      request(server()).post('/auth/login').send({}).expect(400));

    it('campo obrigatório ausente (sem password) → 400', () =>
      request(server()).post('/auth/login').send({ email: 'a@b.com' }).expect(400));

    it('campo inválido (email malformado) → 400', () =>
      request(server())
        .post('/auth/login')
        .send({ email: 'nao-eh-email', password: 'x' })
        .expect(400));

    it('tipo incorreto (email numérico) → 400', () =>
      request(server())
        .post('/auth/login')
        .send({ email: 123, password: 456 })
        .expect(400));

    it('JSON malformado → 400', () =>
      malformed(request(server()).post('/auth/login')).expect(400));
  });

  // ───────────────────────────── POST /requests ─────────────────────────
  describe('POST /requests (STUDENT)', () => {
    it('body vazio → 400', () =>
      asStudent.post('/requests').send({}).expect(400));

    it('campo obrigatório ausente (sem teacherId) → 400', () =>
      asStudent.post('/requests').send({ outro: 1 }).expect(400));

    it('tipo incorreto (teacherId string) → 400', () =>
      asStudent.post('/requests').send({ teacherId: 'abc' }).expect(400));

    it('ID inexistente (teacherId 999999) → 404', () =>
      asStudent.post('/requests').send({ teacherId: NOPE }).expect(404));

    it('JSON malformado → 400', () =>
      malformed(asStudent.post('/requests')).expect(400));
  });

  // ───────────────────── GET /requests/user/:userId ─────────────────────
  describe('GET /requests/user/:userId (COORDINATOR)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asCoordinator.get('/requests/user/abc').expect(400));

    it('ID inexistente → 404', () =>
      asCoordinator.get(`/requests/user/${NOPE}`).expect(404));
  });

  // ──────────────────── PATCH /requests/:id/respond ─────────────────────
  describe('PATCH /requests/:id/respond (TEACHER)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asTeacher.patch('/requests/abc/respond').send({ status: 'ACCEPTED' }).expect(400));

    it('body vazio → 400', () =>
      asTeacher.patch('/requests/1/respond').send({}).expect(400));

    it('campo inválido (status fora do enum) → 400', () =>
      asTeacher.patch('/requests/1/respond').send({ status: 'TALVEZ' }).expect(400));

    it('ID inexistente → 404', () =>
      asTeacher.patch(`/requests/${NOPE}/respond`).send({ status: 'ACCEPTED' }).expect(404));

    it('JSON malformado → 400', () =>
      malformed(asTeacher.patch('/requests/1/respond')).expect(400));
  });

  // ──────────────────── PATCH /notifications/:id/read ───────────────────
  describe('PATCH /notifications/:id/read', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asStudent.patch('/notifications/abc/read').expect(400));

    it('ID inexistente → 404', () =>
      asStudent.patch(`/notifications/${NOPE}/read`).expect(404));
  });

  // ───────────────────────────── GET /students/:id ──────────────────────
  describe('GET /students/:id (TEACHER)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asTeacher.get('/students/abc').expect(400));

    it('ID inexistente → 404', () =>
      asTeacher.get(`/students/${NOPE}`).expect(404));
  });

  // ───────────────────────────── PUT /keywords/me ───────────────────────
  describe('PUT /keywords/me (autenticado)', () => {
    it('body vazio → 400', () =>
      asStudent.put('/keywords/me').send({}).expect(400));

    it('tipo incorreto (keywordIds não-array) → 400', () =>
      asStudent.put('/keywords/me').send({ keywordIds: 'x' }).expect(400));

    it('campo inválido (IDs duplicados) → 400', () =>
      asStudent.put('/keywords/me').send({ keywordIds: [1, 1] }).expect(400));

    it('ID inexistente (keyword inexistente) → 400', () =>
      asStudent.put('/keywords/me').send({ keywordIds: [NOPE] }).expect(400));

    it('JSON malformado → 400', () =>
      malformed(asStudent.put('/keywords/me')).expect(400));
  });

  // ───────────────────── GET /keywords/user/:userId ─────────────────────
  describe('GET /keywords/user/:userId', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asTeacher.get('/keywords/user/abc').expect(400));

    it('ID inexistente → 404', () =>
      asTeacher.get(`/keywords/user/${NOPE}`).expect(404));
  });

  // ──────────────────── PATCH /orientations/:id/status ──────────────────
  describe('PATCH /orientations/:id/status (TEACHER)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asTeacher.patch('/orientations/abc/status').send({ status: 'COMPLETED' }).expect(400));

    it('body vazio → 400', () =>
      asTeacher.patch('/orientations/1/status').send({}).expect(400));

    it('campo inválido (status fora do enum) → 400', () =>
      asTeacher.patch('/orientations/1/status').send({ status: 'PAUSED' }).expect(400));

    it('ID inexistente → 404', () =>
      asTeacher.patch(`/orientations/${NOPE}/status`).send({ status: 'COMPLETED' }).expect(404));

    it('JSON malformado → 400', () =>
      malformed(asTeacher.patch('/orientations/1/status')).expect(400));
  });

  // ───────────────────────── POST /vacancies/define ─────────────────────
  describe('POST /vacancies/define (COORDINATOR)', () => {
    it('body vazio → 400', () =>
      asCoordinator.post('/vacancies/define').send({}).expect(400));

    it('tipo incorreto (teacherId/quantity string) → 400', () =>
      asCoordinator.post('/vacancies/define').send({ teacherId: 'x', quantity: 'y' }).expect(400));

    it('campo inválido (quantity negativa, teacherId < 1) → 400', () =>
      asCoordinator.post('/vacancies/define').send({ teacherId: 0, quantity: -1 }).expect(400));

    it('ID inexistente (teacherId 999999) → 404', () =>
      asCoordinator.post('/vacancies/define').send({ teacherId: NOPE, quantity: 3 }).expect(404));

    it('JSON malformado → 400', () =>
      malformed(asCoordinator.post('/vacancies/define')).expect(400));
  });

  // ────────────────────── GET /vacancies/teacher/:id ────────────────────
  describe('GET /vacancies/teacher/:id (TEACHER)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asTeacher.get('/vacancies/teacher/abc').expect(400));

    it('ID inexistente → 200 com lista vazia (comportamento do projeto)', async () => {
      const res = await asTeacher.get(`/vacancies/teacher/${NOPE}`).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  // ───────────────────────────── POST /semesters ────────────────────────
  describe('POST /semesters (COORDINATOR)', () => {
    it('body vazio → 400', () =>
      asCoordinator.post('/semesters').send({}).expect(400));

    it('tipo incorreto (year string, period numérico) → 400', () =>
      asCoordinator.post('/semesters').send({ year: 'abc', period: 1 }).expect(400));

    it('campo inválido (data não-ISO) → 400', () =>
      asCoordinator
        .post('/semesters')
        .send({ year: 2027, period: '1', vacancyDefStartDate: 'nao-eh-data' })
        .expect(400));

    it('JSON malformado → 400', () =>
      malformed(asCoordinator.post('/semesters')).expect(400));
  });

  // ───────────────────────────── POST /contestations ────────────────────
  describe('POST /contestations (TEACHER)', () => {
    it('body vazio → 400', () =>
      asTeacher.post('/contestations').send({}).expect(400));

    it('campo inválido (motivo curto < 10 chars) → 400', () =>
      asTeacher.post('/contestations').send({ contestationReason: 'curto' }).expect(400));

    it('tipo incorreto (motivo numérico) → 400', () =>
      asTeacher.post('/contestations').send({ contestationReason: 123 }).expect(400));

    it('JSON malformado → 400', () =>
      malformed(asTeacher.post('/contestations')).expect(400));
  });

  // ───────────────────────── PATCH /contestations/:id ───────────────────
  describe('PATCH /contestations/:id (COORDINATOR)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asCoordinator.patch('/contestations/abc').send({ status: 'REJECTED' }).expect(400));

    it('body vazio → 400', () =>
      asCoordinator.patch('/contestations/1').send({}).expect(400));

    it('campo inválido (status fora do enum) → 400', () =>
      asCoordinator.patch('/contestations/1').send({ status: 'TALVEZ' }).expect(400));

    it('ID inexistente → 404', () =>
      asCoordinator.patch(`/contestations/${NOPE}`).send({ status: 'REJECTED' }).expect(404));

    it('JSON malformado → 400', () =>
      malformed(asCoordinator.patch('/contestations/1')).expect(400));
  });

  // ────────────────────── GET /reports/teacher-stats/:id ────────────────
  describe('GET /reports/teacher-stats/:id (COORDINATOR)', () => {
    it('ID inválido (não-numérico) → 400', () =>
      asCoordinator.get('/reports/teacher-stats/abc').expect(400));

    it('ID inexistente → 404', () =>
      asCoordinator.get(`/reports/teacher-stats/${NOPE}`).expect(404));
  });

  // ───────────────────── Método HTTP incorreto → 404 ────────────────────
  // Rota existente, porém método não mapeado → 404 (nunca 500).
  describe('Método HTTP incorreto → 404', () => {
    const cases: Array<[keyof Authed, string]> = [
      ['get', '/auth/login'],
      ['put', '/requests'],
      ['delete', '/requests/1/respond'],
      ['post', '/requests/user/1'],
      ['post', '/notifications/me'],
      ['get', '/notifications/1/read'],
      ['post', '/students'],
      ['delete', '/students/1'],
      ['post', '/keywords'],
      ['delete', '/keywords/me'],
      ['post', '/keywords/user/1'],
      ['post', '/orientations/my-orientations'],
      ['get', '/orientations/1/status'],
      ['get', '/vacancies/define'],
      ['post', '/vacancies/teacher/1'],
      ['delete', '/semesters'],
      ['put', '/contestations'],
      ['get', '/contestations/1'],
      ['post', '/reports/teacher-stats'],
      ['post', '/reports/coordinator-stats'],
      ['post', '/reports/distribution'],
    ];

    it.each(cases)('%s %s → 404', async (method, url) => {
      // Sem token: método não mapeado é resolvido pelo router antes dos guards.
      await (request(app.getHttpServer()) as never as Record<string, (u: string) => request.Test>)[
        method
      ](url).expect(404);
    });
  });

  // ─────────────────── Garantia transversal: nunca 500 ──────────────────
  describe('Nenhuma entrada inválida deve gerar 500', () => {
    const probes: Array<() => request.Test> = [
      () => asStudent.post('/requests').send({}),
      () => asStudent.post('/requests').send({ teacherId: 'abc' }),
      () => asTeacher.patch('/requests/abc/respond').send({ status: 'X' }),
      () => asCoordinator.post('/vacancies/define').send({ teacherId: -1 }),
      () => asCoordinator.post('/semesters').send({ year: 'x' }),
      () => asTeacher.post('/contestations').send({ contestationReason: 1 }),
      () => malformed(asStudent.put('/keywords/me')),
      () => asStudent.get('/students/abc'),
    ];

    it.each(probes.map((p, i) => [i, p] as const))(
      'probe #%i → status < 500',
      async (_i, probe) => {
        const res = await probe();
        expect(res.status).toBeLessThan(500);
        expect(res.status).toBeGreaterThanOrEqual(400);
      },
    );
  });
});
