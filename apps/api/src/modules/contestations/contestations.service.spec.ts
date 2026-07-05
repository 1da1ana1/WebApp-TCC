import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ContestationsService } from './contestations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
  runTransactionWithMock,
} from '../../../test/utils/prisma.mock';

describe('ContestationsService', () => {
  let service: ContestationsService;
  let prisma: PrismaMock;
  let notifications: { notify: jest.Mock };

  /** Fim da definição de vagas no futuro distante → dentro do prazo. */
  const futureVacancyEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  beforeEach(async () => {
    prisma = createPrismaMock();
    notifications = { notify: jest.fn().mockResolvedValue(null) };
    runTransactionWithMock(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContestationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get(ContestationsService);
  });

  describe('create', () => {
    const dto = { contestationReason: 'Tenho mais alunos do que vagas.' };

    it('rejeita quando o usuário não é docente', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, teacher: null } as never);
      await expect(service.create(1, dto)).rejects.toThrow(ForbiddenException);
    });

    it('rejeita quando não há semestre ativo', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: { id: 5 },
      } as never);
      prisma.semester.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('rejeita quando o prazo de contestação já passou', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: { id: 5 },
      } as never);
      prisma.semester.findFirst.mockResolvedValue({
        id: 3,
        vacancyDefEndDate: new Date('2000-01-01T00:00:00.000Z'),
      } as never);
      await expect(service.create(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('rejeita quando o docente não tem vaga no semestre', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: { id: 5 },
      } as never);
      prisma.semester.findFirst.mockResolvedValue({
        id: 3,
        vacancyDefEndDate: futureVacancyEnd,
      } as never);
      prisma.vacancy.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('rejeita quando já existe contestação pendente para a vaga', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Prof',
        teacher: { id: 5 },
      } as never);
      prisma.semester.findFirst.mockResolvedValue({
        id: 3,
        vacancyDefEndDate: futureVacancyEnd,
      } as never);
      prisma.vacancy.findFirst.mockResolvedValue({ id: 8, coordinatorId: 4 } as never);
      prisma.contestation.findFirst.mockResolvedValue({ id: 1 } as never);
      await expect(service.create(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('cria a contestação, marca a vaga como contestada e notifica o coordenador', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Prof',
        teacher: { id: 5 },
      } as never);
      prisma.semester.findFirst.mockResolvedValue({
        id: 3,
        vacancyDefEndDate: futureVacancyEnd,
      } as never);
      prisma.vacancy.findFirst.mockResolvedValue({ id: 8, coordinatorId: 4 } as never);
      prisma.contestation.findFirst.mockResolvedValue(null);
      prisma.contestation.create.mockResolvedValue({ id: 100, status: 'PENDING' } as never);
      prisma.vacancy.update.mockResolvedValue({} as never);
      prisma.coordinator.findUnique.mockResolvedValue({
        id: 4,
        teacher: { userId: 40 },
      } as never);

      const result = await service.create(1, dto);

      expect(prisma.contestation.create).toHaveBeenCalled();
      expect(prisma.vacancy.update).toHaveBeenCalledWith({
        where: { id: 8 },
        data: { isContested: true, contestReason: dto.contestationReason },
      });
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 40, type: 'CONTESTATION' }),
      );
      expect(result.id).toBe(100);
    });
  });

  describe('resolve', () => {
    const coordUser = { id: 1, teacher: { coordinator: { id: 4 } } };

    it('rejeita quando o usuário não é coordenador', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: { coordinator: null },
      } as never);
      await expect(
        service.resolve(1, 100, { status: 'REJECTED' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejeita quando a contestação não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(coordUser as never);
      prisma.contestation.findUnique.mockResolvedValue(null);
      await expect(
        service.resolve(1, 100, { status: 'REJECTED' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejeita quando a contestação já foi resolvida', async () => {
      prisma.user.findUnique.mockResolvedValue(coordUser as never);
      prisma.contestation.findUnique.mockResolvedValue({
        id: 100,
        status: 'ACCEPTED',
      } as never);
      await expect(
        service.resolve(1, 100, { status: 'REJECTED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ACCEPTED sem newQuantity é rejeitado', async () => {
      prisma.user.findUnique.mockResolvedValue(coordUser as never);
      prisma.contestation.findUnique.mockResolvedValue({
        id: 100,
        status: 'PENDING',
        vacancyId: 8,
      } as never);
      await expect(
        service.resolve(1, 100, { status: 'ACCEPTED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ACCEPTED ajusta a quantidade da vaga na transação', async () => {
      prisma.user.findUnique.mockResolvedValue(coordUser as never);
      prisma.contestation.findUnique.mockResolvedValue({
        id: 100,
        status: 'PENDING',
        vacancyId: 8,
      } as never);
      prisma.contestation.update.mockResolvedValue({
        id: 100,
        status: 'ACCEPTED',
      } as never);
      prisma.vacancy.update.mockResolvedValue({} as never);

      const result = await service.resolve(1, 100, {
        status: 'ACCEPTED',
        newQuantity: 6,
      });

      expect(prisma.vacancy.update).toHaveBeenCalledWith({
        where: { id: 8 },
        data: { quantity: 6, isContested: false },
      });
      expect(result.status).toBe('ACCEPTED');
    });

    it('REJECTED encerra a contestação e limpa o flag da vaga', async () => {
      prisma.user.findUnique.mockResolvedValue(coordUser as never);
      prisma.contestation.findUnique.mockResolvedValue({
        id: 100,
        status: 'PENDING',
        vacancyId: 8,
      } as never);
      prisma.contestation.update.mockResolvedValue({
        id: 100,
        status: 'REJECTED',
      } as never);
      prisma.vacancy.update.mockResolvedValue({} as never);

      const result = await service.resolve(1, 100, {
        status: 'REJECTED',
        justification: 'Sem saldo',
      });

      expect(prisma.contestation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'REJECTED' }),
        }),
      );
      expect(result.status).toBe('REJECTED');
    });
  });
});
