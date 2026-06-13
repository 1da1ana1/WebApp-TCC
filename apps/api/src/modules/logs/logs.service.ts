import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/** Prefixo usado para registrar buscas por keyword (RF016 / top keywords). */
export const SEARCH_KEYWORD_PREFIX = 'SEARCH_KEYWORD:';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra um evento de atividade. Usado pelo interceptor e pelo
   * AuthService. Tolerante a falha pelo chamador (fire-and-forget no
   * interceptor) — aqui apenas persiste.
   */
  async record(
    userId: number,
    action: string,
    extra: { loginAt?: Date; logoutAt?: Date; sessionDuration?: number } = {},
  ) {
    return this.prisma.activityLog.create({
      data: { userId, action, ...extra },
    });
  }

  /**
   * GET /logs/user/:userId — lista paginada, mais recentes primeiro.
   */
  async getUserLogs(userId: number, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(Math.max(1, pageSize), 100);
    const skip = (safePage - 1) * safeSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeSize,
      }),
      this.prisma.activityLog.count({ where: { userId } }),
    ]);

    return {
      data,
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.ceil(total / safeSize) || 0,
    };
  }

  /**
   * GET /logs/aggregate — métricas do RF016. Versão simples (contagens);
   * pensada para evoluir conforme as métricas pesadas forem priorizadas.
   */
  async getAggregate() {
    const logs = await this.prisma.activityLog.findMany({
      include: { user: { select: { typeUser: true } } },
    });

    // 1. Atividade por perfil (contagem de eventos por typeUser).
    const activityByProfile: Record<string, number> = {};
    // 2. Pico de atividade por hora do dia (UTC — comparação de instantes,
    //    sem conversão de fuso). Distribuição 0..23 + hora de pico.
    const byHour = Array.from({ length: 24 }, () => 0);
    // 3. Top keywords buscadas (parseadas das ações SEARCH_KEYWORD:<kw>).
    const keywordCount: Record<string, number> = {};

    for (const log of logs) {
      const profile = log.user?.typeUser ?? 'UNKNOWN';
      activityByProfile[profile] = (activityByProfile[profile] ?? 0) + 1;

      byHour[new Date(log.createdAt).getUTCHours()] += 1;

      if (log.action.startsWith(SEARCH_KEYWORD_PREFIX)) {
        const kw = log.action.slice(SEARCH_KEYWORD_PREFIX.length).trim();
        if (kw) keywordCount[kw] = (keywordCount[kw] ?? 0) + 1;
      }
    }

    const peakHour = byHour.reduce(
      (best, count, hour) => (count > byHour[best] ? hour : best),
      0,
    );

    const topSearchedKeywords = Object.entries(keywordCount)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Tempo médio entre o 1º login e a 1ª solicitação (por aluno).
    const avgSecondsToFirstRequest = await this.computeAvgTimeToFirstRequest();

    return {
      totalEvents: logs.length,
      activityByProfile,
      peakActivity: { byHour, peakHourUtc: peakHour },
      topSearchedKeywords,
      avgSecondsToFirstRequest,
    };
  }

  private async computeAvgTimeToFirstRequest(): Promise<number | null> {
    // Primeira solicitação de cada aluno.
    const students = await this.prisma.student.findMany({
      select: {
        userId: true,
        requests: {
          orderBy: { sendDate: 'asc' },
          take: 1,
          select: { sendDate: true },
        },
      },
    });

    // Primeiro LOGIN de cada usuário.
    const firstLogins = await this.prisma.activityLog.groupBy({
      by: ['userId'],
      where: { action: 'LOGIN' },
      _min: { createdAt: true },
    });
    const firstLoginByUser = new Map(
      firstLogins.map((f) => [f.userId, f._min.createdAt]),
    );

    let totalSeconds = 0;
    let counted = 0;
    for (const student of students) {
      const firstRequest = student.requests[0]?.sendDate;
      const firstLogin = firstLoginByUser.get(student.userId);
      if (!firstRequest || !firstLogin) continue;
      const seconds =
        (new Date(firstRequest).getTime() - new Date(firstLogin).getTime()) /
        1000;
      if (seconds >= 0) {
        totalSeconds += seconds;
        counted += 1;
      }
    }

    return counted > 0 ? Math.round(totalSeconds / counted) : null;
  }
}
