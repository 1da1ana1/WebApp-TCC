import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../prisma/prisma.service';
import { createE2EApp } from './utils/e2e-app';

/**
 * Fluxos FELIZES de TODAS as rotas protegidas.
 *
 * Para cada rota: o usuário com o papel adequado faz login (POST /auth/login),
 * recebe o JWT, e o token é anexado automaticamente (helper `as(token)`).
 * Validamos status HTTP, estrutura (campos presentes) e tipos.
 *
 * NÃO há testes de erro aqui (401/403/400/404) — apenas o caminho feliz.
 *
 * Os testes rodam em ORDEM (jest, --runInBand): o cenário é encadeado porque
 * algumas rotas dependem de ids gerados por outras (responder solicitação →
 * orientação → atualizar status; criar contestação → resolver; etc.).
 */
describe('Rotas protegidas — fluxos felizes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const suffix = Date.now();
  const password = '123456';

  // Helpers de request autenticada (preenchidos no beforeAll após o login).
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
    };
  }

  // Ids semeados / capturados ao longo do cenário.
  const seeded = {
    coordinatorUserId: 0,
    coordinatorTeacherId: 0,
    coordinatorId: 0,
    teacherUserId: 0,
    teacherId: 0,
    studentUserId: 0,
    studentId: 0,
    activeSemesterId: 0,
    createdSemesterId: 0,
    keywordIdA: 0,
    keywordIdB: 0,
  };
  const captured = {
    requestId: 0,
    vacancyId: 0,
    orientationId: 0,
    contestationId: 0,
    notificationId: 0,
  };

  const coordinatorEmail = `coord.${suffix}@unicamp.br`;
  const teacherEmail = `teacher.${suffix}@unicamp.br`;
  const studentEmail = `student.${suffix}@unicamp.br`;

  /** POST /auth/login — devolve { access_token, user }. */
  async function login(email: string) {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    expect(typeof res.body.access_token).toBe('string');
    return res.body as {
      access_token: string;
      user: { id: number; teacherId: number | null; studentId: number | null };
    };
  }

  beforeAll(async () => {
    ({ app, prisma } = await createE2EApp());

    const passwordHash = await bcrypt.hash(password, 10);

    const coordinatorUser = await prisma.user.create({
      data: {
        name: 'Coordenadora E2E',
        email: coordinatorEmail,
        password: passwordHash,
        typeUser: 'COORDINATOR',
      },
    });
    seeded.coordinatorUserId = coordinatorUser.id;
    const coordinatorTeacher = await prisma.teacher.create({
      data: { userId: coordinatorUser.id, isCoordinator: true },
    });
    seeded.coordinatorTeacherId = coordinatorTeacher.id;
    const coordinator = await prisma.coordinator.create({
      data: { teacherId: coordinatorTeacher.id },
    });
    seeded.coordinatorId = coordinator.id;

    const teacherUser = await prisma.user.create({
      data: {
        name: 'Professor E2E',
        email: teacherEmail,
        password: passwordHash,
        typeUser: 'TEACHER',
      },
    });
    seeded.teacherUserId = teacherUser.id;
    const teacher = await prisma.teacher.create({
      data: { userId: teacherUser.id },
    });
    seeded.teacherId = teacher.id;

    const studentUser = await prisma.user.create({
      data: {
        name: 'Aluno E2E',
        email: studentEmail,
        password: passwordHash,
        typeUser: 'STUDENT',
      },
    });
    seeded.studentUserId = studentUser.id;
    const student = await prisma.student.create({
      data: { userId: studentUser.id, ra: `${suffix}` },
    });
    seeded.studentId = student.id;

    // Semestre ativo com janela de contestação aberta (fim no futuro).
    const semester = await prisma.semester.create({
      data: {
        year: 2026,
        period: '1',
        isActive: true,
        vacancyDefEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    seeded.activeSemesterId = semester.id;

    // Vocabulário controlado mínimo para os endpoints de keywords.
    const kwA = await prisma.keyword.create({ data: { name: `KW-A-${suffix}` } });
    const kwB = await prisma.keyword.create({ data: { name: `KW-B-${suffix}` } });
    seeded.keywordIdA = kwA.id;
    seeded.keywordIdB = kwB.id;

    // Logins reais → JWT de cada papel.
    const coordLogin = await login(coordinatorEmail);
    const teacherLogin = await login(teacherEmail);
    const studentLogin = await login(studentEmail);

    asCoordinator = makeAuthed(coordLogin.access_token);
    asTeacher = makeAuthed(teacherLogin.access_token);
    asStudent = makeAuthed(studentLogin.access_token);
  });

  afterAll(async () => {
    const teacherIds = [seeded.coordinatorTeacherId, seeded.teacherId];
    const userIds = [
      seeded.coordinatorUserId,
      seeded.teacherUserId,
      seeded.studentUserId,
    ];
    await prisma.contestation.deleteMany({ where: { teacherId: { in: teacherIds } } });
    await prisma.vacancy.deleteMany({ where: { teacherId: { in: teacherIds } } });
    await prisma.orientation.deleteMany({
      where: { supervisorId: { in: teacherIds } },
    });
    await prisma.request.deleteMany({ where: { studentId: seeded.studentId } });
    await prisma.userKeyword.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.keyword.deleteMany({
      where: { id: { in: [seeded.keywordIdA, seeded.keywordIdB] } },
    });
    await prisma.coordinator.deleteMany({ where: { teacherId: seeded.coordinatorTeacherId } });
    await prisma.student.deleteMany({ where: { id: seeded.studentId } });
    await prisma.teacher.deleteMany({ where: { id: { in: teacherIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.semester.deleteMany({
      where: { id: { in: [seeded.activeSemesterId, seeded.createdSemesterId] } },
    });
    // app.close() dispara o $disconnect do PrismaService.
    await app.close();
  });

  // ───────────────────────────── Semesters ─────────────────────────────
  describe('Semesters', () => {
    it('POST /semesters (COORDINATOR) → 201 + semestre tipado', async () => {
      const res = await asCoordinator
        .post('/semesters')
        .send({ year: 2027, period: '2', isActive: false })
        .expect(201);

      expect(typeof res.body.id).toBe('number');
      expect(typeof res.body.year).toBe('number');
      expect(typeof res.body.period).toBe('string');
      expect(typeof res.body.isActive).toBe('boolean');
      expect(res.body.year).toBe(2027);
      seeded.createdSemesterId = res.body.id;

      // Persistência no banco (Prisma): registro criado com os dados corretos.
      const saved = await prisma.semester.findUnique({
        where: { id: res.body.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.year).toBe(2027);
      expect(saved!.period).toBe('2');
      expect(saved!.isActive).toBe(false);
    });

    it('GET /semesters (autenticado) → 200 + lista de semestres', async () => {
      const res = await asTeacher.get('/semesters').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const s = res.body[0];
      expect(typeof s.id).toBe('number');
      expect(typeof s.year).toBe('number');
      expect(typeof s.period).toBe('string');
    });
  });

  // ───────────────────────────── Vacancies ─────────────────────────────
  describe('Vacancies', () => {
    it('POST /vacancies/define (COORDINATOR) → 201 + vaga tipada', async () => {
      const res = await asCoordinator
        .post('/vacancies/define')
        .send({ teacherId: seeded.teacherId, quantity: 3, semesterId: seeded.activeSemesterId })
        .expect(201);

      expect(typeof res.body.id).toBe('number');
      expect(typeof res.body.quantity).toBe('number');
      expect(res.body.quantity).toBe(3);
      expect(res.body.teacherId).toBe(seeded.teacherId);
      expect(res.body.semesterId).toBe(seeded.activeSemesterId);
      expect(typeof res.body.isContested).toBe('boolean');
      captured.vacancyId = res.body.id;

      // Persistência no banco: vaga criada com quantidade/relacionamentos corretos.
      const saved = await prisma.vacancy.findUnique({
        where: { id: res.body.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.quantity).toBe(3);
      expect(saved!.teacherId).toBe(seeded.teacherId);
      expect(saved!.semesterId).toBe(seeded.activeSemesterId);
      expect(saved!.coordinatorId).toBe(seeded.coordinatorId);
      expect(saved!.isContested).toBe(false);
    });

    it('GET /vacancies/teacher/:id (TEACHER) → 200 + lista com semestre', async () => {
      const res = await asTeacher
        .get(`/vacancies/teacher/${seeded.teacherId}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const v = res.body[0];
      expect(typeof v.id).toBe('number');
      expect(typeof v.quantity).toBe('number');
      expect(v.teacherId).toBe(seeded.teacherId);
      expect(v).toHaveProperty('semester');
    });
  });

  // ───────────────────────────── Requests ──────────────────────────────
  describe('Requests', () => {
    it('POST /requests (STUDENT) → 201 + solicitação PENDING', async () => {
      const res = await asStudent
        .post('/requests')
        .send({ teacherId: seeded.teacherId })
        .expect(201);

      expect(typeof res.body.id).toBe('number');
      expect(res.body.status).toBe('PENDING');
      expect(res.body.studentId).toBe(seeded.studentId);
      expect(res.body.teacherId).toBe(seeded.teacherId);
      captured.requestId = res.body.id;

      // Persistência no banco: solicitação criada como PENDING e bem vinculada.
      const saved = await prisma.request.findUnique({
        where: { id: res.body.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.status).toBe('PENDING');
      expect(saved!.studentId).toBe(seeded.studentId);
      expect(saved!.teacherId).toBe(seeded.teacherId);
      expect(saved!.responseDate).toBeNull();
    });

    it('GET /requests (STUDENT) → 200 + lista do próprio usuário', async () => {
      const res = await asStudent.get('/requests').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const r = res.body[0];
      expect(typeof r.id).toBe('number');
      expect(typeof r.status).toBe('string');
      expect(r).toHaveProperty('teacher');
    });

    it('GET /requests/user/:userId (COORDINATOR) → 200 + lista', async () => {
      const res = await asCoordinator
        .get(`/requests/user/${seeded.studentUserId}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(typeof res.body[0].id).toBe('number');
    });

    it('PATCH /requests/:id/respond (TEACHER, ACCEPTED) → 200', async () => {
      const res = await asTeacher
        .patch(`/requests/${captured.requestId}/respond`)
        .send({ status: 'ACCEPTED' })
        .expect(200);

      expect(res.body.id).toBe(captured.requestId);
      expect(res.body.status).toBe('ACCEPTED');
      expect(typeof res.body.responseDate).toBe('string');

      // Persistência: a alteração de status realmente ocorreu...
      const saved = await prisma.request.findUnique({
        where: { id: captured.requestId },
      });
      expect(saved!.status).toBe('ACCEPTED');
      expect(saved!.responseDate).not.toBeNull();

      // ...e a orientação correspondente foi criada (efeito colateral do aceite).
      const orientation = await prisma.orientation.findFirst({
        where: { supervisorId: seeded.teacherId, status: 'ACTIVE' },
        include: { students: { select: { id: true } } },
      });
      expect(orientation).not.toBeNull();
      expect(orientation!.semesterId).toBe(seeded.activeSemesterId);
      expect(orientation!.students.map((s) => s.id)).toContain(seeded.studentId);
    });
  });

  // ─────────────────────────── Orientations ────────────────────────────
  describe('Orientations', () => {
    it('GET /orientations/my-orientations (TEACHER) → 200 + lista', async () => {
      const res = await asTeacher.get('/orientations/my-orientations').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const o = res.body[0];
      expect(typeof o.id).toBe('number');
      expect(typeof o.status).toBe('string');
      expect(o).toHaveProperty('students');
      captured.orientationId = o.id;
    });

    it('PATCH /orientations/:id/status (TEACHER, COMPLETED) → 200', async () => {
      const res = await asTeacher
        .patch(`/orientations/${captured.orientationId}/status`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(res.body.id).toBe(captured.orientationId);
      expect(res.body.status).toBe('COMPLETED');
      expect(typeof res.body.endDate).toBe('string');

      // Persistência: status atualizado para COMPLETED e endDate carimbado...
      const saved = await prisma.orientation.findUnique({
        where: { id: captured.orientationId },
      });
      expect(saved!.status).toBe('COMPLETED');
      expect(saved!.endDate).not.toBeNull();

      // ...e a transição foi registrada na auditoria (ActivityLog).
      const log = await prisma.activityLog.findFirst({
        where: { action: `ORIENTATION_COMPLETED#${captured.orientationId}` },
      });
      expect(log).not.toBeNull();
    });
  });

  // ───────────────────────────── Students ──────────────────────────────
  describe('Students', () => {
    it('GET /students (TEACHER) → 200 + resumo tipado', async () => {
      const res = await asTeacher.get('/students').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((s: { id: number }) => s.id === seeded.studentId);
      expect(found).toBeDefined();
      expect(typeof found.name).toBe('string');
      expect(typeof found.ra).toBe('string');
      expect(Array.isArray(found.keywords)).toBe(true);
    });

    it('GET /students/me (STUDENT) → 200 + perfil completo', async () => {
      const res = await asStudent.get('/students/me').expect(200);
      expect(res.body.id).toBe(seeded.studentId);
      expect(typeof res.body.ra).toBe('string');
      expect(res.body).toHaveProperty('user');
      expect(typeof res.body.user.email).toBe('string');
      expect(Array.isArray(res.body.keywords)).toBe(true);
      expect(Array.isArray(res.body.requests)).toBe(true);
    });

    it('GET /students/:id (TEACHER) → 200 + perfil read-only', async () => {
      const res = await asTeacher.get(`/students/${seeded.studentId}`).expect(200);
      expect(res.body.id).toBe(seeded.studentId);
      expect(typeof res.body.ra).toBe('string');
      expect(res.body).toHaveProperty('user');
      expect(Array.isArray(res.body.requests)).toBe(true);
    });
  });

  // ───────────────────────────── Keywords ──────────────────────────────
  describe('Keywords', () => {
    it('GET /keywords (autenticado) → 200 + vocabulário', async () => {
      const res = await asStudent.get('/keywords').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const k = res.body[0];
      expect(typeof k.id).toBe('number');
      expect(typeof k.name).toBe('string');
    });

    it('PUT /keywords/me (STUDENT) → 200 + keywords vinculadas', async () => {
      const res = await asStudent
        .put('/keywords/me')
        .send({ keywordIds: [seeded.keywordIdA, seeded.keywordIdB] })
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(typeof res.body[0].id).toBe('number');
      expect(typeof res.body[0].name).toBe('string');

      // Persistência: exatamente os 2 vínculos (UserKeyword) foram criados.
      const links = await prisma.userKeyword.findMany({
        where: { userId: seeded.studentUserId },
      });
      expect(links.map((l) => l.keywordId).sort()).toEqual(
        [seeded.keywordIdA, seeded.keywordIdB].sort(),
      );
    });

    it('GET /keywords/user/:userId (autenticado) → 200 + lista', async () => {
      const res = await asTeacher
        .get(`/keywords/user/${seeded.studentUserId}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('PUT /keywords/me (subconjunto) → 200 + remoção dos antigos no banco', async () => {
      // O PUT substitui o conjunto: ao enviar só A, o vínculo de B deve sumir.
      await asStudent
        .put('/keywords/me')
        .send({ keywordIds: [seeded.keywordIdA] })
        .expect(200);

      const links = await prisma.userKeyword.findMany({
        where: { userId: seeded.studentUserId },
      });
      expect(links).toHaveLength(1);
      expect(links[0].keywordId).toBe(seeded.keywordIdA);

      // Confirma explicitamente que o vínculo de B foi REMOVIDO.
      const removed = await prisma.userKeyword.findUnique({
        where: {
          userId_keywordId: {
            userId: seeded.studentUserId,
            keywordId: seeded.keywordIdB,
          },
        },
      });
      expect(removed).toBeNull();
    });
  });

  // ───────────────────────────── Reports ───────────────────────────────
  describe('Reports', () => {
    const expectTeacherStatsShape = (body: Record<string, unknown>) => {
      expect(typeof body.totalRequests).toBe('number');
      expect(typeof body.acceptedRequests).toBe('number');
      expect(typeof body.acceptanceRate).toBe('string'); // ex.: "100%"
      expect(typeof body.activeOrientations).toBe('number');
      expect(typeof body.completedOrientations).toBe('number');
    };

    it('GET /reports/teacher-stats (TEACHER) → 200 + estatísticas', async () => {
      const res = await asTeacher.get('/reports/teacher-stats').expect(200);
      expectTeacherStatsShape(res.body);
    });

    it('GET /reports/teacher-stats/:id (COORDINATOR) → 200', async () => {
      const res = await asCoordinator
        .get(`/reports/teacher-stats/${seeded.teacherUserId}`)
        .expect(200);
      expectTeacherStatsShape(res.body);
    });

    it('GET /reports/coordinator-stats (COORDINATOR) → 200', async () => {
      const res = await asCoordinator.get('/reports/coordinator-stats').expect(200);
      expect(typeof res.body.totalStudents).toBe('number');
      expect(typeof res.body.studentsWithOrientation).toBe('number');
      expect(typeof res.body.studentsWithoutOrientation).toBe('number');
      expect(Array.isArray(res.body.overloadedTeachers)).toBe(true);
    });

    it('GET /reports/distribution (COORDINATOR) → 200', async () => {
      const res = await asCoordinator.get('/reports/distribution').expect(200);
      expect(res.body).toHaveProperty('period');
      expect(Array.isArray(res.body.distribution)).toBe(true);
    });

    it('GET /reports/teacher-stats/export (COORDINATOR) → 200 + CSV', async () => {
      const res = await asCoordinator
        .get('/reports/teacher-stats/export')
        .expect(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(typeof res.text).toBe('string');
      expect(res.text).toContain('teacherId');
    });
  });

  // ─────────────────────────── Contestations ───────────────────────────
  describe('Contestations', () => {
    it('POST /contestations (TEACHER) → 201 + contestação PENDING', async () => {
      const res = await asTeacher
        .post('/contestations')
        .send({ contestationReason: 'Tenho mais alunos aptos do que vagas recebidas.' })
        .expect(201);

      expect(typeof res.body.id).toBe('number');
      expect(res.body.status).toBe('PENDING');
      expect(res.body.teacherId).toBe(seeded.teacherId);
      captured.contestationId = res.body.id;

      // Persistência: contestação criada PENDING e vinculada à vaga...
      const saved = await prisma.contestation.findUnique({
        where: { id: res.body.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.status).toBe('PENDING');
      expect(saved!.teacherId).toBe(seeded.teacherId);
      expect(saved!.vacancyId).toBe(captured.vacancyId);

      // ...e a vaga foi marcada como contestada (efeito colateral, mesma transação).
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: captured.vacancyId },
      });
      expect(vacancy!.isContested).toBe(true);
    });

    it('GET /contestations (COORDINATOR) → 200 + pendentes', async () => {
      const res = await asCoordinator.get('/contestations').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find(
        (c: { id: number }) => c.id === captured.contestationId,
      );
      expect(found).toBeDefined();
      expect(found).toHaveProperty('teacher');
    });

    it('PATCH /contestations/:id (COORDINATOR, ACCEPTED) → 200', async () => {
      const res = await asCoordinator
        .patch(`/contestations/${captured.contestationId}`)
        .send({ status: 'ACCEPTED', newQuantity: 5 })
        .expect(200);

      expect(res.body.id).toBe(captured.contestationId);
      expect(res.body.status).toBe('ACCEPTED');
      expect(typeof res.body.resolvedAt).toBe('string');

      // Persistência: contestação resolvida (ACCEPTED + resolvedAt)...
      const saved = await prisma.contestation.findUnique({
        where: { id: captured.contestationId },
      });
      expect(saved!.status).toBe('ACCEPTED');
      expect(saved!.resolvedAt).not.toBeNull();

      // ...e a vaga teve a quantidade ajustada e isContested limpo (transação).
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: captured.vacancyId },
      });
      expect(vacancy!.quantity).toBe(5);
      expect(vacancy!.isContested).toBe(false);
    });
  });

  // ─────────────────────────── Notifications ───────────────────────────
  describe('Notifications', () => {
    it('GET /notifications/me (TEACHER) → 200 + notificações', async () => {
      const res = await asTeacher.get('/notifications/me').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const n = res.body[0];
      expect(typeof n.id).toBe('number');
      expect(typeof n.type).toBe('string');
      expect(typeof n.title).toBe('string');
      expect(typeof n.read).toBe('boolean');
      captured.notificationId = n.id;
    });

    it('PATCH /notifications/:id/read (TEACHER) → 200 + read=true', async () => {
      const res = await asTeacher
        .patch(`/notifications/${captured.notificationId}/read`)
        .expect(200);
      expect(res.body.id).toBe(captured.notificationId);
      expect(res.body.read).toBe(true);

      // Persistência: a notificação ficou marcada como lida no banco.
      const saved = await prisma.notification.findUnique({
        where: { id: captured.notificationId },
      });
      expect(saved!.read).toBe(true);
    });
  });

  // ─────────────────────────────── Auth ────────────────────────────────
  describe('Auth', () => {
    it('POST /auth/logout (autenticado) → 201 + log de LOGOUT', async () => {
      const res = await asStudent.post('/auth/logout').expect(201);
      expect(typeof res.body.id).toBe('number');
      expect(res.body.action).toBe('LOGOUT');

      // Persistência: o registro de LOGOUT foi gravado para o usuário.
      const saved = await prisma.activityLog.findUnique({
        where: { id: res.body.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.userId).toBe(seeded.studentUserId);
      expect(saved!.action).toBe('LOGOUT');
    });
  });
});
