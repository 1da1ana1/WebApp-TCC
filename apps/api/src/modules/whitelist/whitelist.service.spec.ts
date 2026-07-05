import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../../test/utils/prisma.mock';

describe('WhitelistService', () => {
  let service: WhitelistService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [WhitelistService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(WhitelistService);
  });

  describe('parseCsv', () => {
    it('faz parse de CSV com header e mapeia as roles para o enum', () => {
      const csv = 'email,role\naluno@ft.unicamp.br,Student\nprofa@ft.unicamp.br,Teacher';
      const { records, rejections, totalRows } = service.parseCsv(csv);

      expect(totalRows).toBe(2);
      expect(rejections).toHaveLength(0);
      expect(records).toEqual([
        { email: 'aluno@ft.unicamp.br', role: 'STUDENT' },
        { email: 'profa@ft.unicamp.br', role: 'TEACHER' },
      ]);
    });

    it('assume ordem email,role quando não há header', () => {
      const { records } = service.parseCsv('joao@x.com,teacher');
      expect(records).toEqual([{ email: 'joao@x.com', role: 'TEACHER' }]);
    });

    it('rejeita e-mail inválido e role inválida, preservando os válidos', () => {
      const csv = [
        'email,role',
        'ok@x.com,Student',
        'invalido,Teacher', // e-mail inválido
        'outro@x.com,Professor', // role inválida
      ].join('\n');

      const { records, rejections } = service.parseCsv(csv);

      expect(records).toEqual([{ email: 'ok@x.com', role: 'STUDENT' }]);
      expect(rejections).toHaveLength(2);
      expect(rejections[0].reason).toMatch(/E-mail inválido/);
      expect(rejections[1].reason).toMatch(/Role inválida/);
    });

    it('normaliza e-mail para minúsculas e aceita separador ponto-e-vírgula', () => {
      const { records } = service.parseCsv('email;role\nJOAO@X.COM;Student');
      expect(records).toEqual([{ email: 'joao@x.com', role: 'STUDENT' }]);
    });
  });

  describe('importFromCsv', () => {
    it('persiste registros válidos com skipDuplicates e retorna a contagem', async () => {
      prisma.whitelist.createMany.mockResolvedValue({ count: 2 } as never);

      const result = await service.importFromCsv(
        'email,role\na@x.com,Student\nb@x.com,Teacher',
      );

      expect(prisma.whitelist.createMany).toHaveBeenCalledWith({
        data: [
          { email: 'a@x.com', role: 'STUDENT' },
          { email: 'b@x.com', role: 'TEACHER' },
        ],
        skipDuplicates: true,
      });
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
    });

    it('deduplica e-mails repetidos dentro do próprio arquivo antes de persistir', async () => {
      prisma.whitelist.createMany.mockResolvedValue({ count: 1 } as never);

      await service.importFromCsv('email,role\na@x.com,Student\na@x.com,Teacher');

      expect(prisma.whitelist.createMany).toHaveBeenCalledWith({
        data: [{ email: 'a@x.com', role: 'STUDENT' }],
        skipDuplicates: true,
      });
    });

    it('reporta duplicatas ignoradas pelo banco na mensagem', async () => {
      // 2 válidos no arquivo, mas banco só inseriu 1 (o outro já existia).
      prisma.whitelist.createMany.mockResolvedValue({ count: 1 } as never);

      const result = await service.importFromCsv(
        'email,role\na@x.com,Student\nb@x.com,Teacher',
      );

      expect(result.importedCount).toBe(1);
      expect(result.message).toMatch(/1 já existia/);
    });

    it('lança 400 quando não há nenhuma linha válida', async () => {
      await expect(
        service.importFromCsv('email,role\ninvalido,Professor'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.whitelist.createMany).not.toHaveBeenCalled();
    });

    it('lança 400 quando o arquivo está vazio', async () => {
      await expect(service.importFromCsv('   ')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
