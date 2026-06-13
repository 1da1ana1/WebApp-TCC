import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateContestationDto } from './dto/create-contestation.dto';
import { ResolveContestationDto } from './dto/resolve-contestation.dto';
import { NotificationsService } from '../notifications/notifications.service';

/** Janela de contestação: até 7 dias após o fim da definição de vagas. */
const CONTEST_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ContestationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * POST /contestations — docente contesta a sua vaga do semestre ativo,
   * desde que dentro do prazo (vacancyDefEndDate + 7 dias).
   */
  async create(userId: number, dto: CreateContestationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: true },
    });
    if (!user?.teacher) {
      throw new ForbiddenException('Apenas docentes podem contestar vagas.');
    }
    const teacherId = user.teacher.id;

    const activeSemester = await this.prisma.semester.findFirst({
      where: { isActive: true },
    });
    if (!activeSemester) {
      throw new NotFoundException('Nenhum semestre ativo no momento.');
    }

    // Prazo. Comparamos instantes absolutos (UTC) — não há parsing de hora
    // local nem conversão de fuso, então o cálculo é imune ao timezone de
    // Brasília. A janela é vacancyDefEndDate + 7×24h.
    if (!activeSemester.vacancyDefEndDate) {
      throw new BadRequestException(
        'Período de definição de vagas não configurado neste semestre.',
      );
    }
    const deadline = new Date(
      activeSemester.vacancyDefEndDate.getTime() + CONTEST_WINDOW_DAYS * DAY_MS,
    );
    if (new Date() > deadline) {
      throw new BadRequestException(
        `Prazo de contestação encerrado (até ${CONTEST_WINDOW_DAYS} dias após o fim da definição de vagas).`,
      );
    }

    const vacancy = await this.prisma.vacancy.findFirst({
      where: { teacherId, semesterId: activeSemester.id },
    });
    if (!vacancy) {
      throw new NotFoundException(
        'Você não possui vagas definidas neste semestre para contestar.',
      );
    }

    const alreadyPending = await this.prisma.contestation.findFirst({
      where: { teacherId, vacancyId: vacancy.id, status: 'PENDING' },
    });
    if (alreadyPending) {
      throw new BadRequestException(
        'Você já possui uma contestação pendente para esta vaga.',
      );
    }

    // Cria a contestação e marca a vaga como contestada atomicamente.
    const contestation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.contestation.create({
        data: {
          contestationReason: dto.contestationReason,
          status: 'PENDING',
          teacherId,
          coordinatorId: vacancy.coordinatorId,
          vacancyId: vacancy.id,
        },
      });
      await tx.vacancy.update({
        where: { id: vacancy.id },
        data: { isContested: true, contestReason: dto.contestationReason },
      });
      return created;
    });

    // Notifica o coordenador dono da vaga (best-effort).
    const coordinator = await this.prisma.coordinator.findUnique({
      where: { id: vacancy.coordinatorId },
      include: { teacher: true },
    });
    if (coordinator?.teacher) {
      await this.notifications.notify({
        userId: coordinator.teacher.userId,
        type: 'CONTESTATION',
        title: 'Nova contestação de vagas',
        body: `${user.name} contestou as vagas atribuídas.`,
        link: '/perfil-coordenador',
      });
    }

    return contestation;
  }

  /** GET /contestations — lista as contestações pendentes (coordenador). */
  async findPending() {
    return this.prisma.contestation.findMany({
      where: { status: 'PENDING' },
      include: {
        teacher: { include: { user: { select: { name: true, email: true } } } },
        vacancy: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * PATCH /contestations/:id — coordenador aceita/recusa.
   * ACCEPTED: exige newQuantity e atualiza Vacancy.quantity na mesma
   * transação. REJECTED: apenas encerra a contestação.
   */
  async resolve(
    userId: number,
    contestationId: number,
    dto: ResolveContestationDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: { include: { coordinator: true } } },
    });
    if (!user?.teacher?.coordinator) {
      throw new ForbiddenException(
        'Apenas coordenadores podem resolver contestações.',
      );
    }

    const contestation = await this.prisma.contestation.findUnique({
      where: { id: contestationId },
    });
    if (!contestation) {
      throw new NotFoundException('Contestação não encontrada.');
    }
    if (contestation.status !== 'PENDING') {
      throw new BadRequestException('Esta contestação já foi resolvida.');
    }

    if (dto.status === 'ACCEPTED') {
      if (dto.newQuantity === undefined || dto.newQuantity === null) {
        throw new BadRequestException(
          'newQuantity é obrigatório ao aceitar uma contestação.',
        );
      }
      if (!contestation.vacancyId) {
        throw new BadRequestException(
          'Contestação sem vaga associada — não há quantidade para ajustar.',
        );
      }
      const vacancyId = contestation.vacancyId;
      const newQuantity = dto.newQuantity;
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.contestation.update({
          where: { id: contestationId },
          data: { status: 'ACCEPTED', resolvedAt: new Date() },
        });
        await tx.vacancy.update({
          where: { id: vacancyId },
          data: { quantity: newQuantity, isContested: false },
        });
        return updated;
      });
    }

    // REJECTED. `dto.justification` chega da UI, mas não há campo no schema
    // para persisti-lo — fica disponível para auditoria futura, não gravado.
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.contestation.update({
        where: { id: contestationId },
        data: { status: 'REJECTED', resolvedAt: new Date() },
      });
      if (contestation.vacancyId) {
        await tx.vacancy.update({
          where: { id: contestation.vacancyId },
          data: { isContested: false },
        });
      }
      return updated;
    });
  }
}
