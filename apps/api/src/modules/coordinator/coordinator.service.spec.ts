import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../../test/utils/prisma.mock';

describe('CoordinatorService (RF020)', () => {
  let service: CoordinatorService;
  let prisma: PrismaMock;

  // Coordenador logado: User 1 -> Teacher 10 -> Coordinator 100.
  const currentUser = {
    id: 1,
    typeUser: 'COORDINATOR',
    teacher: { id: 10, coordinator: { id: 100 } },
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CoordinatorService);

    // $transaction recebe um array de promessas — resolve como Promise.all.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.$transaction.mockImplementation((arg: any) =>
      Array.isArray(arg) ? Promise.all(arg) : Promise.resolve(arg(prisma)),
    );
  });

  it('rejeita se o coordenador atual não tiver registro Coordinator', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      teacher: { id: 10, coordinator: null },
    } as never);

    await expect(service.transfer(1, 20)).rejects.toThrow(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejeita transferência para si mesmo', async () => {
    prisma.user.findUnique.mockResolvedValue(currentUser as never);

    await expect(service.transfer(1, 10)).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejeita se o docente alvo não existir', async () => {
    prisma.user.findUnique.mockResolvedValue(currentUser as never);
    prisma.teacher.findUnique.mockResolvedValue(null);

    await expect(service.transfer(1, 20)).rejects.toThrow(NotFoundException);
  });

  it('rejeita se o alvo não for um TEACHER ativo', async () => {
    prisma.user.findUnique.mockResolvedValue(currentUser as never);
    prisma.teacher.findUnique.mockResolvedValue({
      id: 20,
      userId: 2,
      user: { id: 2, typeUser: 'STUDENT' },
    } as never);

    await expect(service.transfer(1, 20)).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('executa a transferência atômica: rebaixa, promove, move Coordinator e audita', async () => {
    prisma.user.findUnique.mockResolvedValue(currentUser as never);
    prisma.teacher.findUnique.mockResolvedValue({
      id: 20,
      userId: 2,
      user: { id: 2, typeUser: 'TEACHER' },
    } as never);

    const result = await service.transfer(1, 20);

    // Rebaixa o atual.
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { typeUser: 'TEACHER' },
    });
    expect(prisma.teacher.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { isCoordinator: false },
    });
    // Promove o alvo.
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { typeUser: 'COORDINATOR' },
    });
    expect(prisma.teacher.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { isCoordinator: true },
    });
    // Move o registro Coordinator para o novo docente.
    expect(prisma.coordinator.update).toHaveBeenCalledWith({
      where: { id: 100 },
      data: { teacherId: 20 },
    });
    // Auditoria com quem -> para quem.
    expect(prisma.activityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 1,
          action: 'TRANSFER_COORDINATION',
        }),
      }),
    );
    // Tudo dentro de UMA transação.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      success: true,
      message: 'Coordenação transferida com sucesso.',
      from: { userId: 1, teacherId: 10 },
      to: { userId: 2, teacherId: 20 },
    });
  });
});
