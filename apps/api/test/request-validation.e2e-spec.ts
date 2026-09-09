import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2EApp } from './utils/e2e-app';

describe('Request Validation (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const suffix = Date.now();
  const password = '123456';

  const coordinatorEmail = `coordinator.${suffix}@unicamp.br`;
  const teacherEmail = `teacher.${suffix}@unicamp.br`;
  const studentEmail = `student.${suffix}@unicamp.br`;
  const student2Email = `student2.${suffix}@unicamp.br`;

  let coordinatorUserId: number;
  let coordinatorTeacherId: number;
  let teacherUserId: number;
  let studentUserId: number;
  let student2UserId: number;
  let semesterId: number;
  let teacherId: number;
  let studentId: number;
  let student2Id: number;
  let studentToken: string;
  let student2Token: string;

  beforeAll(async () => {
    ({ app, prisma } = await createE2EApp());

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create coordinator
    const coordinatorUser = await prisma.user.create({
      data: {
        name: 'Coordenador E2E Validação',
        email: coordinatorEmail,
        password: hashedPassword,
        typeUser: 'COORDINATOR',
      },
    });
    coordinatorUserId = coordinatorUser.id;

    const coordinatorTeacher = await prisma.teacher.create({
      data: {
        userId: coordinatorUser.id,
        isCoordinator: true,
      },
    });
    coordinatorTeacherId = coordinatorTeacher.id;

    await prisma.coordinator.create({
      data: {
        teacherId: coordinatorTeacher.id,
      },
    });

    // Create active semester
    const semester = await prisma.semester.create({
      data: {
        year: 2026,
        period: '2',
        isActive: true,
      },
    });
    semesterId = semester.id;

    // Create teacher
    const teacherUser = await prisma.user.create({
      data: {
        name: 'Professor E2E Validação',
        email: teacherEmail,
        password: hashedPassword,
        typeUser: 'TEACHER',
      },
    });
    teacherUserId = teacherUser.id;

    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
      },
    });
    teacherId = teacher.id;

    // Create first student
    const studentUser = await prisma.user.create({
      data: {
        name: 'Aluno E2E Validação',
        email: studentEmail,
        password: hashedPassword,
        typeUser: 'STUDENT',
      },
    });
    studentUserId = studentUser.id;

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        ra: `${suffix}`,
      },
    });
    studentId = student.id;

    // Create second student
    const student2User = await prisma.user.create({
      data: {
        name: 'Aluno 2 E2E Validação',
        email: student2Email,
        password: hashedPassword,
        typeUser: 'STUDENT',
      },
    });
    student2UserId = student2User.id;

    const student2 = await prisma.student.create({
      data: {
        userId: student2User.id,
        ra: `${suffix + 1}`,
      },
    });
    student2Id = student2.id;

    // Authenticate students
    const studentLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: studentEmail, password })
      .expect(201);
    studentToken = studentLogin.body.access_token;

    const student2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: student2Email, password })
      .expect(201);
    student2Token = student2Login.body.access_token;

    // Login coordinator and define vacancies for teacher
    const coordinatorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: coordinatorEmail, password })
      .expect(201);
    const coordinatorToken: string = coordinatorLogin.body.access_token;

    await request(app.getHttpServer())
      .post('/vacancies/define')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({ teacherId, quantity: 2, semesterId })
      .expect(201);
  });

  afterAll(async () => {
    await prisma.orientationMember.deleteMany({
      where: { teacherId: { in: [coordinatorTeacherId, teacherId] } },
    });
    await prisma.orientation.deleteMany({
      where: {
        OR: [
          { supervisorId: { in: [coordinatorTeacherId, teacherId] } },
          { students: { some: { id: { in: [studentId, student2Id] } } } },
        ],
      },
    });
    await prisma.request.deleteMany({
      where: {
        OR: [
          { studentId: { in: [studentId, student2Id] } },
          { teacherId: { in: [coordinatorTeacherId, teacherId] } },
        ],
      },
    });
    await prisma.contestation.deleteMany({
      where: { teacherId: { in: [coordinatorTeacherId, teacherId] } },
    });
    await prisma.vacancy.deleteMany({
      where: { teacherId: { in: [coordinatorTeacherId, teacherId] } },
    });
    await prisma.coordinator.deleteMany({ where: { teacherId: coordinatorTeacherId } });
    await prisma.student.deleteMany({ where: { id: { in: [studentId, student2Id] } } });
    await prisma.teacher.deleteMany({
      where: { id: { in: [coordinatorTeacherId, teacherId] } },
    });

    const userIds = [coordinatorUserId, teacherUserId, studentUserId, student2UserId];
    await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.semester.deleteMany({ where: { id: semesterId } });

    await app.close();
  });

  describe('POST /requests - Success Cases', () => {
    it('should create request with PENDING status', async () => {
      const response = await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(201);

      expect(response.body).toMatchObject({
        status: 'PENDING',
        teacherId,
        studentId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.sendDate).toBeDefined();

      // Verify in database
      const dbRequest = await prisma.request.findUnique({
        where: { id: response.body.id },
      });
      expect(dbRequest).toBeTruthy();
      expect(dbRequest.status).toBe('PENDING');
    });

    it('should create notification for teacher when request is created', async () => {
      const notificationsBefore = await prisma.notification.count({
        where: { userId: teacherUserId },
      });

      await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({ teacherId })
        .expect(201);

      const notificationsAfter = await prisma.notification.count({
        where: { userId: teacherUserId },
      });

      expect(notificationsAfter).toBeGreaterThan(notificationsBefore);
    });
  });

  describe('POST /requests - Error Cases', () => {
    it('should return 400 when student already has a PENDING request', async () => {
      // First request succeeds
      await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(201);

      // Second request should fail
      const response = await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(400);

      expect(response.body.message).toMatch(/já possui uma solicitação pendente/i);
    });

    it('should return 404 when teacher does not exist', async () => {
      const nonExistentTeacherId = 999999;

      const response = await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId: nonExistentTeacherId })
        .expect(404);

      expect(response.body.message).toMatch(/professor não encontrado/i);
    });

    it('should return 400 when teacherId is missing', async () => {
      await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when teacherId is not a number', async () => {
      await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId: 'invalid' })
        .expect(400);
    });

    it('should return 401 when no authentication token is provided', async () => {
      await request(app.getHttpServer())
        .post('/requests')
        .send({ teacherId })
        .expect(401);
    });
  });

  describe('GET /requests - Retrieve User Requests', () => {
    beforeAll(async () => {
      // Clean up existing requests for this test
      await prisma.request.deleteMany({
        where: { studentId },
      });
    });

    it('should return empty array when student has no requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return student requests with teacher information', async () => {
      // Create a request
      await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        teacherId,
        studentId,
        status: 'PENDING',
      });
      expect(response.body[0].teacher).toBeDefined();
      expect(response.body[0].teacher.user).toBeDefined();
    });

    it('should only return requests for authenticated student', async () => {
      // Student 2 should not see student 1's requests
      const response = await request(app.getHttpServer())
        .get('/requests')
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(200);

      const student1Requests = response.body.filter(
        (req: any) => req.studentId === studentId,
      );
      expect(student1Requests.length).toBe(0);
    });
  });

  describe('POST /requests - Business Rule Validation', () => {
    it('should allow new request after previous one is rejected', async () => {
      // Clean up
      await prisma.request.deleteMany({ where: { studentId } });

      // Create first request
      const firstRequest = await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(201);

      // Simulate teacher rejecting the request (would normally be done via PATCH /requests/:id/respond)
      await prisma.request.update({
        where: { id: firstRequest.body.id },
        data: { status: 'REJECTED' },
      });

      // Student should be able to create a new request now
      await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(201);
    });

    it('should prevent request when student already has an APPROVED request', async () => {
      // Clean up
      await prisma.request.deleteMany({ where: { studentId } });

      // Create and approve request
      const approvedRequest = await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(201);

      await prisma.request.update({
        where: { id: approvedRequest.body.id },
        data: { status: 'APPROVED' },
      });

      // Try to create another request - should fail
      const response = await request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ teacherId })
        .expect(400);

      expect(response.body.message).toMatch(/já possui uma solicitação pendente/i);
    });
  });
});
