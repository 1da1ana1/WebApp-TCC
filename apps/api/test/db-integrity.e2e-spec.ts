import { PrismaClient } from '@prisma/client';

/**
 * Testes de INTEGRIDADE do banco (schema Prisma/PostgreSQL), exercitando as
 * constraints diretamente via Prisma Client — sem passar pela camada HTTP.
 *
 * Cobre: unique constraints, foreign keys, cascade/SetNull, relacionamentos,
 * registros duplicados e consistência (defaults, nulabilidade, atomicidade).
 *
 * INDEPENDÊNCIA: cada teste cria os próprios dados com identificadores únicos
 * e registra a limpeza em `trash`; o `afterEach` apaga tudo em ordem LIFO
 * (filhos antes de pais). Nenhum teste depende de ordem ou estado de outro.
 *
 * Observação sobre o schema: NÃO há `onDelete: Cascade` explícito. O único
 * cascade real é o da relação M2M implícita Student↔Orientation; as FKs
 * obrigatórias são Restrict e a opcional Request.teacherId é SetNull.
 */
describe('Integridade do banco (e2e)', () => {
  const prisma = new PrismaClient();

  // Sufixo único por registro → evita colisões entre testes/execuções.
  const base = Date.now();
  let seq = 0;
  const uniq = (p: string) => `${p}-${base}-${seq++}`;

  // Pilha de limpeza (LIFO): cada criação empilha seu delete.
  const trash: Array<() => Promise<unknown>> = [];
  const track = (fn: () => Promise<unknown>) => trash.push(fn);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
    while (trash.length) {
      const fn = trash.pop()!;
      try {
        await fn();
      } catch {
        // Best-effort: registro já pode ter sido removido pelo próprio teste.
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ───────────────────────── Fábricas (com tracking) ────────────────────
  async function aUser(typeUser = 'STUDENT') {
    const u = await prisma.user.create({
      data: { name: 'User', email: `${uniq('user')}@test.com`, password: 'hash', typeUser },
    });
    track(() => prisma.user.delete({ where: { id: u.id } }));
    return u;
  }
  async function aStudent(userId?: number) {
    const uid = userId ?? (await aUser('STUDENT')).id;
    const s = await prisma.student.create({ data: { userId: uid, ra: uniq('ra') } });
    track(() => prisma.student.delete({ where: { id: s.id } }));
    return s;
  }
  async function aTeacher(userId?: number, data: Record<string, unknown> = {}) {
    const uid = userId ?? (await aUser('TEACHER')).id;
    const t = await prisma.teacher.create({ data: { userId: uid, ...data } });
    track(() => prisma.teacher.delete({ where: { id: t.id } }));
    return t;
  }
  async function aCoordinator() {
    const teacher = await aTeacher(undefined, { isCoordinator: true });
    const coordinator = await prisma.coordinator.create({ data: { teacherId: teacher.id } });
    track(() => prisma.coordinator.delete({ where: { id: coordinator.id } }));
    return { teacher, coordinator };
  }
  async function aKeyword() {
    const k = await prisma.keyword.create({ data: { name: uniq('kw') } });
    track(() => prisma.keyword.delete({ where: { id: k.id } }));
    return k;
  }
  async function anOrientation(data: Record<string, unknown> = {}) {
    const o = await prisma.orientation.create({ data: { status: 'ACTIVE', ...data } });
    track(() => prisma.orientation.delete({ where: { id: o.id } }));
    return o;
  }

  // ─────────────────────────── Unique constraints ───────────────────────
  describe('Unique constraints', () => {
    it('User.email é único → P2002 ao duplicar', async () => {
      const u = await aUser();
      await expect(
        prisma.user.create({
          data: { name: 'Dup', email: u.email, password: 'x', typeUser: 'STUDENT' },
        }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('Keyword.name é único → P2002 ao duplicar', async () => {
      const k = await aKeyword();
      await expect(
        prisma.keyword.create({ data: { name: k.name } }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('Student.ra é único → P2002 ao duplicar', async () => {
      const s = await aStudent();
      const otherUser = await aUser('STUDENT');
      await expect(
        prisma.student.create({ data: { userId: otherUser.id, ra: s.ra } }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('Teacher.userId é 1:1 → P2002 ao criar 2 docentes para o mesmo usuário', async () => {
      const teacher = await aTeacher();
      await expect(
        prisma.teacher.create({ data: { userId: teacher.userId } }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('UserKeyword tem PK composta (userId, keywordId) → P2002 ao duplicar o par', async () => {
      const user = await aUser();
      const kw = await aKeyword();
      await prisma.userKeyword.create({ data: { userId: user.id, keywordId: kw.id } });
      track(() =>
        prisma.userKeyword.deleteMany({ where: { userId: user.id, keywordId: kw.id } }),
      );
      await expect(
        prisma.userKeyword.create({ data: { userId: user.id, keywordId: kw.id } }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('OrientationMember tem par único (orientationId, teacherId) → P2002', async () => {
      const teacher = await aTeacher();
      const orientation = await anOrientation();
      const m = await prisma.orientationMember.create({
        data: { orientationId: orientation.id, teacherId: teacher.id },
      });
      track(() => prisma.orientationMember.delete({ where: { id: m.id } }));
      await expect(
        prisma.orientationMember.create({
          data: { orientationId: orientation.id, teacherId: teacher.id },
        }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });
  });

  // ───────────────────────────── Foreign keys ───────────────────────────
  describe('Foreign keys', () => {
    it('Student com userId inexistente → P2003', async () => {
      await expect(
        prisma.student.create({ data: { userId: 999999999, ra: uniq('ra') } }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('Request com studentId inexistente → P2003', async () => {
      await expect(
        prisma.request.create({ data: { studentId: 999999999, status: 'PENDING' } }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('ActivityLog com userId inexistente → P2003', async () => {
      await expect(
        prisma.activityLog.create({ data: { userId: 999999999, action: 'LOGIN' } }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('Vacancy com coordinatorId/teacherId inexistentes → P2003', async () => {
      await expect(
        prisma.vacancy.create({
          data: { quantity: 1, teacherId: 999999999, coordinatorId: 999999999 },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });
  });

  // ──────────────────────── Cascade / referential actions ───────────────
  describe('Cascade e ações referenciais', () => {
    it('M2M implícita: apagar Orientation remove os vínculos, mas mantém o Student (cascade do join)', async () => {
      const student = await aStudent();
      const orientation = await anOrientation({
        students: { connect: { id: student.id } },
      });

      await prisma.orientation.delete({ where: { id: orientation.id } });

      const stillThere = await prisma.student.findUnique({
        where: { id: student.id },
        include: { orientations: true },
      });
      expect(stillThere).not.toBeNull(); // student NÃO foi apagado
      expect(stillThere!.orientations).toHaveLength(0); // vínculo removido
    });

    it('Request.teacherId é SetNull: apagar o Teacher zera a referência, sem apagar a Request', async () => {
      const student = await aStudent();
      const teacher = await aTeacher();
      const req = await prisma.request.create({
        data: { studentId: student.id, teacherId: teacher.id, status: 'PENDING' },
      });
      track(() => prisma.request.delete({ where: { id: req.id } }));

      await prisma.teacher.delete({ where: { id: teacher.id } });

      const after = await prisma.request.findUnique({ where: { id: req.id } });
      expect(after).not.toBeNull(); // request preservada
      expect(after!.teacherId).toBeNull(); // FK opcional zerada
    });

    it('FK obrigatória é Restrict: apagar User com Student dependente → P2003 (sem cascade)', async () => {
      const user = await aUser('STUDENT');
      await aStudent(user.id);
      await expect(
        prisma.user.delete({ where: { id: user.id } }),
      ).rejects.toMatchObject({ code: 'P2003' });
      // O User continua íntegro (a exclusão foi bloqueada).
      const stillThere = await prisma.user.findUnique({ where: { id: user.id } });
      expect(stillThere).not.toBeNull();
    });
  });

  // ───────────────────────────── Relacionamentos ────────────────────────
  describe('Relacionamentos', () => {
    it('1:1 — User ↔ Student navegável nos dois sentidos', async () => {
      const user = await aUser('STUDENT');
      const student = await aStudent(user.id);

      const fromUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { student: true },
      });
      expect(fromUser!.student!.id).toBe(student.id);

      const fromStudent = await prisma.student.findUnique({
        where: { id: student.id },
        include: { user: true },
      });
      expect(fromStudent!.user.id).toBe(user.id);
    });

    it('1:N — Teacher → Vacancy[] (duas vagas)', async () => {
      const { coordinator } = await aCoordinator();
      const teacher = await aTeacher();
      for (const quantity of [1, 2]) {
        const v = await prisma.vacancy.create({
          data: { quantity, teacherId: teacher.id, coordinatorId: coordinator.id },
        });
        track(() => prisma.vacancy.delete({ where: { id: v.id } }));
      }

      const withVacancies = await prisma.teacher.findUnique({
        where: { id: teacher.id },
        include: { vacancies: true },
      });
      expect(withVacancies!.vacancies).toHaveLength(2);
    });

    it('N:N — Student ↔ Orientation navegável nos dois sentidos', async () => {
      const student = await aStudent();
      const teacher = await aTeacher();
      const orientation = await anOrientation({
        supervisorId: teacher.id,
        students: { connect: { id: student.id } },
      });

      const fromOrientation = await prisma.orientation.findUnique({
        where: { id: orientation.id },
        include: { students: true },
      });
      expect(fromOrientation!.students.map((s) => s.id)).toContain(student.id);

      const fromStudent = await prisma.student.findUnique({
        where: { id: student.id },
        include: { orientations: true },
      });
      expect(fromStudent!.orientations.map((o) => o.id)).toContain(orientation.id);
    });
  });

  // ───────────────────────── Registros duplicados ───────────────────────
  describe('Registros duplicados', () => {
    it('createMany com skipDuplicates ignora o que já existe', async () => {
      const existing = await aKeyword();
      const novo = uniq('kw');
      const { count } = await prisma.keyword.createMany({
        data: [{ name: existing.name }, { name: novo }],
        skipDuplicates: true,
      });
      track(() => prisma.keyword.deleteMany({ where: { name: novo } }));

      expect(count).toBe(1); // só o novo entrou
      const total = await prisma.keyword.count({ where: { name: existing.name } });
      expect(total).toBe(1); // não duplicou o existente
    });

    it('createMany SEM skipDuplicates rejeita duplicata → P2002', async () => {
      const existing = await aKeyword();
      await expect(
        prisma.keyword.createMany({ data: [{ name: existing.name }] }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });
  });

  // ───────────────────────── Consistência dos dados ─────────────────────
  describe('Consistência dos dados', () => {
    it('valores default são aplicados (Vacancy.isContested, Contestation.status, Notification.read, Semester.isActive)', async () => {
      const { coordinator, teacher } = await aCoordinator();

      const vacancy = await prisma.vacancy.create({
        data: { quantity: 2, teacherId: teacher.id, coordinatorId: coordinator.id },
      });
      track(() => prisma.vacancy.delete({ where: { id: vacancy.id } }));
      expect(vacancy.isContested).toBe(false);

      const contestation = await prisma.contestation.create({
        data: {
          contestationReason: 'motivo qualquer suficientemente longo',
          teacherId: teacher.id,
          coordinatorId: coordinator.id,
        },
      });
      track(() => prisma.contestation.delete({ where: { id: contestation.id } }));
      expect(contestation.status).toBe('PENDING');
      expect(contestation.resolvedAt).toBeNull();

      const user = await aUser();
      const notification = await prisma.notification.create({
        data: { userId: user.id, type: 'NEW_REQUEST', title: 't', body: 'b' },
      });
      track(() => prisma.notification.delete({ where: { id: notification.id } }));
      expect(notification.read).toBe(false);

      const semester = await prisma.semester.create({ data: { year: 2031, period: '1' } });
      track(() => prisma.semester.delete({ where: { id: semester.id } }));
      expect(semester.isActive).toBe(false);
    });

    it('campos opcionais nascem nulos e sendDate é preenchido por default', async () => {
      const student = await aStudent();
      const req = await prisma.request.create({
        data: { studentId: student.id, status: 'PENDING' },
      });
      track(() => prisma.request.delete({ where: { id: req.id } }));

      expect(req.sendDate).toBeInstanceOf(Date); // default now()
      expect(req.responseDate).toBeNull();
      expect(req.denialJustification).toBeNull();
      expect(req.teacherId).toBeNull();
    });

    it('atomicidade: $transaction que falha no meio faz rollback total', async () => {
      const existing = await aKeyword();
      const novo = uniq('kw');

      await expect(
        prisma.$transaction([
          prisma.keyword.create({ data: { name: novo } }),
          prisma.keyword.create({ data: { name: existing.name } }), // viola unique
        ]),
      ).rejects.toMatchObject({ code: 'P2002' });

      // O primeiro create foi revertido — `novo` não deve existir.
      const found = await prisma.keyword.findUnique({ where: { name: novo } });
      expect(found).toBeNull();
    });
  });
});
