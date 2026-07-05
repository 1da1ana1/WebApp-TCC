import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../../test/utils/prisma.mock';

describe('VacanciesService', () => {
  let service: VacanciesService;
  let prisma: PrismaMock;
  let notifications: { notify: jest.Mock };

  const coordUser = {
    id: 1,
    teacher: { id: 9, coordinator: { id: 4 } },
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    notifications = { notify: jest.fn().mockResolvedValue(null) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacanciesService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get(VacanciesService);
  });

  it('rejeita quando o usuário não tem registro de Coordinator', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, teacher: null } as never);

    await expect(
      service.defineVacancies(1, { teacherId: 5, quantity: 3 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejeita quando o docente alvo não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(coordUser as never);
    prisma.teacher.findUnique.mockResolvedValue(null);

    await expect(
      service.defineVacancies(1, { teacherId: 5, quantity: 3 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('cria vaga nova usando o semestre ativo quando semesterId é omitido', async () => {
    prisma.user.findUnique.mockResolvedValue(coordUser as never);
    prisma.teacher.findUnique.mockResolvedValue({ id: 5, userId: 50 } as never);
    prisma.semester.findFirst.mockResolvedValue({ id: 12, isActive: true } as never);
    prisma.vacancy.findFirst.mockResolvedValue(null);
    prisma.vacancy.create.mockResolvedValue({ id: 1, quantity: 3 } as never);

    const result = await service.defineVacancies(1, { teacherId: 5, quantity: 3 });

    expect(prisma.vacancy.create).toHaveBeenCalledWith({
      data: { quantity: 3, teacherId: 5, semesterId: 12, coordinatorId: 4 },
    });
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 50, type: 'VACANCY_DEFINED' }),
    );
    expect(result.id).toBe(1);
  });

  it('atualiza a vaga existente em vez de criar', async () => {
    prisma.user.findUnique.mockResolvedValue(coordUser as never);
    prisma.teacher.findUnique.mockResolvedValue({ id: 5, userId: 50 } as never);
    prisma.semester.findUnique.mockResolvedValue({ id: 12 } as never);
    prisma.vacancy.findFirst.mockResolvedValue({ id: 77 } as never);
    prisma.vacancy.update.mockResolvedValue({ id: 77, quantity: 8 } as never);

    await service.defineVacancies(1, { teacherId: 5, quantity: 8, semesterId: 12 });

    expect(prisma.vacancy.update).toHaveBeenCalledWith({
      where: { id: 77 },
      data: { quantity: 8, coordinatorId: 4 },
    });
    expect(prisma.vacancy.create).not.toHaveBeenCalled();
  });

  it('rejeita quando o semestre informado não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(coordUser as never);
    prisma.teacher.findUnique.mockResolvedValue({ id: 5, userId: 50 } as never);
    prisma.semester.findUnique.mockResolvedValue(null);

    await expect(
      service.defineVacancies(1, { teacherId: 5, quantity: 3, semesterId: 999 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejeita quando não há semestre ativo e nenhum foi informado', async () => {
    prisma.user.findUnique.mockResolvedValue(coordUser as never);
    prisma.teacher.findUnique.mockResolvedValue({ id: 5, userId: 50 } as never);
    prisma.semester.findFirst.mockResolvedValue(null);

    await expect(
      service.defineVacancies(1, { teacherId: 5, quantity: 3 }),
    ).rejects.toThrow(NotFoundException);
  });
});
