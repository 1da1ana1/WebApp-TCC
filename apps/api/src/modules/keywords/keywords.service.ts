import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

const MAX_KEYWORDS_PER_USER = 5;

@Injectable()
export class KeywordsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.keyword.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async setUserKeywords(userId: number, keywordIds: number[]) {
    if (keywordIds.length > MAX_KEYWORDS_PER_USER) {
      throw new BadRequestException(
        `Máximo de ${MAX_KEYWORDS_PER_USER} keywords por usuário.`,
      );
    }

    const uniqueIds = Array.from(new Set(keywordIds));

    if (uniqueIds.length > 0) {
      const existing = await this.prisma.keyword.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });
      if (existing.length !== uniqueIds.length) {
        throw new BadRequestException(
          'Algum keywordId informado não existe no vocabulário controlado.',
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.userKeyword.deleteMany({ where: { userId } }),
      this.prisma.userKeyword.createMany({
        data: uniqueIds.map((keywordId) => ({ userId, keywordId })),
      }),
    ]);

    return this.findByUserId(userId);
  }

  async findByUserId(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException(`Usuário ${userId} não encontrado.`);
    }

    const userKeywords = await this.prisma.userKeyword.findMany({
      where: { userId },
      include: { keyword: true },
      orderBy: { keyword: { name: 'asc' } },
    });

    return userKeywords.map((uk) => uk.keyword);
  }
}