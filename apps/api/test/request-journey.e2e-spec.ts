import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Request Journey (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

  const suffix = Date.now();
  const password = '123456';

  const coordinatorEmail = `coordinator.${suffix}@unicamp.br`;
  const teacherEmail = `teacher.${suffix}@unicamp.br`;
  const studentEmail = `student.${suffix}@unicamp.br`;

  let coordinatorUserId: number;
  let coordinatorTeacherId: number;
  let teacherUserId: number;
  let studentUserId: number;
  let semesterId: number;
  let teacherId: number;
  let studentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const hashedPassword = await bcrypt.hash(password, 10);

    const coordinatorUser = await prisma.user.create({
      data: {
        name: 'Coordenador E2E',
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

    const semester = await prisma.semester.create({
      data: {
        year: 2026,
        period: '1',
        isActive: true,
      },
    });
    semesterId = semester.id;

    const teacherUser = await prisma.user.create({
      data: {
        name: 'Professor E2E',
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

    const studentUser = await prisma.user.create({
      data: {
        name: 'Aluno E2E',
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
  });

  afterAll(async () => {
    await prisma.orientationMember.deleteMany({
      where: {
        teacherId: {
          in: [coordinatorTeacherId, teacherId],
        },
      },
    });
    await prisma.orientation.deleteMany({
      where: {
        OR: [
          { supervisorId: { in: [coordinatorTeacherId, teacherId] } },
          { students: { some: { id: studentId } } },
        ],
      },
    });
    await prisma.request.deleteMany({
      where: {
        OR: [
          { studentId },
          { teacherId: { in: [coordinatorTeacherId, teacherId] } },
        ],
      },
    });
    await prisma.contestation.deleteMany({
      where: {
        teacherId: {
          in: [coordinatorTeacherId, teacherId],
        },
      },
    });
    await prisma.vacancy.deleteMany({
      where: {
        teacherId: {
          in: [coordinatorTeacherId, teacherId],
        },
      },
    });
    await prisma.coordinator.deleteMany({ where: { teacherId: coordinatorTeacherId } });
    await prisma.student.deleteMany({ where: { id: studentId } });
    await prisma.teacher.deleteMany({ where: { id: { in: [coordinatorTeacherId, teacherId] } } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [coordinatorUserId, teacherUserId, studentUserId] },
      },
    });
    await prisma.semester.deleteMany({ where: { id: semesterId } });

    await app.close();
    await prisma.$disconnect();
  });

  it('authenticates teacher and student, creates vacancy, and creates request with DB validation', async () => {
    const teacherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: teacherEmail, password })
      .expect(201);

    const teacherToken: string = teacherLogin.body.access_token;
    expect(teacherToken).toBeDefined();

    await request(app.getHttpServer())
      .post('/vacancies/define')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ quantity: 3 })
      .expect(201);

    const studentLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: studentEmail, password })
      .expect(201);

    const studentToken: string = studentLogin.body.access_token;
    expect(studentToken).toBeDefined();

    const requestResponse = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ teacherId })
      .expect(201);

    expect(requestResponse.body.status).toBe('PENDING');
    expect(requestResponse.body.teacherId).toBe(teacherId);

    const createdRequest = await prisma.request.findFirst({
      where: {
        studentId,
        teacherId,
        status: 'PENDING',
      },
    });

    expect(createdRequest).not.toBeNull();
  });
});
