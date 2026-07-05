import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../../test/utils/prisma.mock';

describe('RequestsService', () => {
  let service: RequestsService;
  let prisma: PrismaMock;
  let notifications: { notify: jest.Mock };

  beforeEach(async () => {
    prisma = createPrismaMock();
    notifications = { notify: jest.fn().mockResolvedValue(null) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get(RequestsService);
  });

  describe('createRequest', () => {
    it('rejeita quando o usuário não é aluno', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.createRequest(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita quando o professor não existe', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 7,
        userId: 1,
        user: { name: 'Aluno' },
      } as never);
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.createRequest(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejeita quando já existe solicitação pendente', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 7,
        userId: 1,
        user: { name: 'Aluno' },
      } as never);
      prisma.teacher.findUnique.mockResolvedValue({ id: 5, userId: 50 } as never);
      prisma.request.findFirst.mockResolvedValue({ id: 1 } as never);

      await expect(service.createRequest(1, 5)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.request.create).not.toHaveBeenCalled();
    });

    it('cria a solicitação PENDING e notifica o docente', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 7,
        userId: 1,
        user: { name: 'Aluno' },
      } as never);
      prisma.teacher.findUnique.mockResolvedValue({ id: 5, userId: 50 } as never);
      prisma.request.findFirst.mockResolvedValue(null);
      prisma.request.create.mockResolvedValue({
        id: 200,
        studentId: 7,
        teacherId: 5,
        status: 'PENDING',
      } as never);

      const result = await service.createRequest(1, 5);

      expect(prisma.request.create).toHaveBeenCalledWith({
        data: { studentId: 7, teacherId: 5, status: 'PENDING' },
      });
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 50, type: 'NEW_REQUEST' }),
      );
      expect(result.status).toBe('PENDING');
    });
  });

  describe('respondRequest', () => {
    const teacherUser = { id: 1, name: 'Prof', teacher: { id: 5 } };

    it('rejeita quando o usuário não é docente', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: null,
      } as never);

      await expect(
        service.respondRequest(1, 200, 'ACCEPTED'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejeita quando a solicitação não pertence ao docente', async () => {
      prisma.user.findUnique.mockResolvedValue(teacherUser as never);
      prisma.request.findUnique.mockResolvedValue({
        id: 200,
        teacherId: 999,
        status: 'PENDING',
      } as never);

      await expect(
        service.respondRequest(1, 200, 'ACCEPTED'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejeita quando a solicitação já foi respondida', async () => {
      prisma.user.findUnique.mockResolvedValue(teacherUser as never);
      prisma.request.findUnique.mockResolvedValue({
        id: 200,
        teacherId: 5,
        status: 'ACCEPTED',
      } as never);

      await expect(
        service.respondRequest(1, 200, 'ACCEPTED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('exige justificativa ao recusar', async () => {
      prisma.user.findUnique.mockResolvedValue(teacherUser as never);
      prisma.request.findUnique.mockResolvedValue({
        id: 200,
        teacherId: 5,
        status: 'PENDING',
        studentId: 7,
      } as never);

      await expect(
        service.respondRequest(1, 200, 'REJECTED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('ao ACEITAR: atualiza, cria orientação e notifica o aluno', async () => {
      prisma.user.findUnique.mockResolvedValue(teacherUser as never);
      prisma.request.findUnique.mockResolvedValue({
        id: 200,
        teacherId: 5,
        status: 'PENDING',
        studentId: 7,
      } as never);
      prisma.request.update.mockResolvedValue({
        id: 200,
        status: 'ACCEPTED',
      } as never);
      prisma.semester.findFirst.mockResolvedValue({ id: 3 } as never);
      prisma.orientation.create.mockResolvedValue({ id: 1 } as never);
      prisma.student.findUnique.mockResolvedValue({
        id: 7,
        userId: 70,
      } as never);

      const result = await service.respondRequest(1, 200, 'ACCEPTED');

      expect(prisma.orientation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'ACTIVE',
            supervisorId: 5,
            semesterId: 3,
          }),
        }),
      );
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 70, type: 'REQUEST_RESPONSE' }),
      );
      expect(result.status).toBe('ACCEPTED');
    });

    it('ao RECUSAR com justificativa: não cria orientação', async () => {
      prisma.user.findUnique.mockResolvedValue(teacherUser as never);
      prisma.request.findUnique.mockResolvedValue({
        id: 200,
        teacherId: 5,
        status: 'PENDING',
        studentId: 7,
      } as never);
      prisma.request.update.mockResolvedValue({
        id: 200,
        status: 'REJECTED',
      } as never);
      prisma.student.findUnique.mockResolvedValue({
        id: 7,
        userId: 70,
      } as never);

      await service.respondRequest(1, 200, 'REJECTED', 'Sem vaga');

      expect(prisma.orientation.create).not.toHaveBeenCalled();
      expect(prisma.request.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'REJECTED',
            denialJustification: 'Sem vaga',
          }),
        }),
      );
    });
  });

  describe('getUserRequests', () => {
    it('retorna [] quando o usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      expect(await service.getUserRequests(1)).toEqual([]);
    });

    it('filtra por studentId quando o usuário é STUDENT', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        typeUser: 'STUDENT',
        student: { id: 7 },
        teacher: null,
      } as never);
      prisma.request.findMany.mockResolvedValue([{ id: 1 }] as never);

      await service.getUserRequests(1);

      expect(prisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studentId: 7 } }),
      );
    });

    it('filtra por teacherId quando o usuário é TEACHER', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        typeUser: 'TEACHER',
        student: null,
        teacher: { id: 5 },
      } as never);
      prisma.request.findMany.mockResolvedValue([] as never);

      await service.getUserRequests(1);

      expect(prisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { teacherId: 5 } }),
      );
    });
  });
});
