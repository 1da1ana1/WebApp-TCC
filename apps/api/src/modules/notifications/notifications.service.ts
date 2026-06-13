import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma notificação persistida. É BEST-EFFORT: usado dentro de fluxos
   * de negócio (nova solicitação, resposta, etc.), nunca deve derrubar a
   * ação principal — por isso engole o erro e apenas loga.
   *
   * RF003 / e-mail: o envio por e-mail é um TODO (ver abaixo). A notificação
   * persistida + pop-up no front já cobrem a parte síncrona do requisito.
   */
  async notify(params: {
    userId: number;
    type: string;
    title: string;
    body: string;
    link?: string;
  }) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          body: params.body,
          link: params.link,
        },
      });

      // TODO: SMTP/SendGrid — disparar e-mail assíncrono (RF003). Não bloquear
      // o fluxo; o pop-up no front já cumpre a parte síncrona do requisito.

      return notification;
    } catch (err) {
      this.logger.warn(
        `Falha ao criar notificação (userId=${params.userId}, type=${params.type}): ${err}`,
      );
      return null;
    }
  }

  /** GET /notifications/me — notificações do usuário, mais recentes primeiro. */
  async getMine(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** PATCH /notifications/:id/read — marca como lida (valida posse). */
  async markRead(userId: number, id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada.');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Esta notificação não pertence a você.');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
