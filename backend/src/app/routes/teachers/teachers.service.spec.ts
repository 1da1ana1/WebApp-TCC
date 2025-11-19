import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from './teachers.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: PrismaService,
          useValue: {
            teacher: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return a list of teachers', async () => {
    const mock = [
      { id: 1, name: 'A', email: 'a@test.com' },
      { id: 2, name: 'B', email: 'b@test.com' },
    ];

    (prisma.teacher.findMany as jest.Mock).mockResolvedValue(mock);

    const result = await service.findAll();
    expect(result).toEqual(mock);
    expect(prisma.teacher.findMany).toHaveBeenCalled();
  });

  it('should return one teacher', async () => {
    const mock = { id: 1, name: 'A', email: 'a@test.com' };

    (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(mock);

    const result = await service.findOne('1');
    expect(result).toEqual(mock);
    expect(prisma.teacher.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw NotFoundException when teacher does not exist', async () => {
    (prisma.teacher.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
  });
});
