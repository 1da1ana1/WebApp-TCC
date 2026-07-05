import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../../test/utils/prisma.mock';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ReportsService);
  });

  describe('getTeacherStats', () => {
    it('rejeita quando o usuário não é docente', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, teacher: null } as never);
      await expect(service.getTeacherStats(1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('calcula a taxa de aceitação como percentual', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: { id: 5 },
      } as never);
      // totalRequests=4, accepted=1 → 25%
      prisma.request.count
        .mockResolvedValueOnce(4 as never) // totalRequests
        .mockResolvedValueOnce(1 as never); // acceptedRequests
      prisma.orientation.count
        .mockResolvedValueOnce(2 as never) // active
        .mockResolvedValueOnce(3 as never); // completed

      const stats = await service.getTeacherStats(5);

      expect(stats).toEqual({
        totalRequests: 4,
        acceptedRequests: 1,
        acceptanceRate: '25%',
        activeOrientations: 2,
        completedOrientations: 3,
        semesterId: null,
      });
    });

    it('retorna 0% quando não há solicitações', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        teacher: { id: 5 },
      } as never);
      prisma.request.count.mockResolvedValue(0 as never);
      prisma.orientation.count.mockResolvedValue(0 as never);

      const stats = await service.getTeacherStats(5);
      expect(stats.acceptanceRate).toBe('0%');
    });
  });

  describe('getCoordinatorStats', () => {
    it('calcula alunos sem orientação como total - com orientação ativa', async () => {
      prisma.student.count.mockResolvedValue(10 as never);
      prisma.orientation.count.mockResolvedValue(4 as never);
      prisma.teacher.findMany.mockResolvedValue([
        { user: { name: 'Prof A' }, _count: { attendedRequests: 2 } },
      ] as never);

      const stats = await service.getCoordinatorStats(1);

      expect(stats.totalStudents).toBe(10);
      expect(stats.studentsWithOrientation).toBe(4);
      expect(stats.studentsWithoutOrientation).toBe(6);
      expect(stats.overloadedTeachers).toEqual([
        { name: 'Prof A', rejections: 2 },
      ]);
    });
  });

  describe('getDistribution', () => {
    it('soma orientandos por docente e ordena por maior carga', async () => {
      prisma.teacher.findMany.mockResolvedValue([
        { id: 1, user: { name: 'Prof A' } },
        { id: 2, user: { name: 'Prof B' } },
      ] as never);
      prisma.orientation.findMany
        // Prof A: 1 orientação com 1 aluno
        .mockResolvedValueOnce([{ students: [{ id: 1 }] }] as never)
        // Prof B: 1 orientação com 2 alunos
        .mockResolvedValueOnce([{ students: [{ id: 2 }, { id: 3 }] }] as never);

      const { distribution } = await service.getDistribution({});

      expect(distribution[0]).toEqual(
        expect.objectContaining({ teacherName: 'Prof B', orientandos: 2 }),
      );
      expect(distribution[1]).toEqual(
        expect.objectContaining({ teacherName: 'Prof A', orientandos: 1 }),
      );
    });
  });

  describe('getTeacherStatsCsv', () => {
    it('gera CSV com cabeçalho, BOM e uma linha por docente', async () => {
      prisma.teacher.findMany.mockResolvedValue([
        { id: 1, user: { name: 'Prof A', email: 'a@x.com' } },
      ] as never);
      prisma.request.count.mockResolvedValue(0 as never);
      prisma.orientation.count.mockResolvedValue(0 as never);

      const csv = await service.getTeacherStatsCsv({});

      expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM
      const lines = csv.replace(/^﻿/, '').split('\r\n');
      expect(lines[0]).toContain('teacherId');
      expect(lines[0]).toContain('acceptanceRate');
      expect(lines[1]).toContain('Prof A');
      expect(lines[1]).toContain('a@x.com');
    });
  });
});
