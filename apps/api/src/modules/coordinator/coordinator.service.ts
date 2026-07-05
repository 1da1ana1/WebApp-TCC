import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CoordinatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * RF020 — Transferência de coordenação ("passagem de bastão").
   *
   * `currentUserId` é o `User.id` do coordenador logado (req.user.sub).
   * `targetTeacherId` é o `Teacher.id` do docente que assumirá a coordenação.
   *
   * Nota de escopo: a spec do RF020 lista 3 operações (rebaixar, promover,
   * auditar). Este sistema, porém, resolve "quem é o coordenador" por TRÊS
   * representações que precisam permanecer coerentes:
   *   - `User.typeUser` (usado pelo RolesGuard);
   *   - `Teacher.isCoordinator` (flag);
   *   - o registro `Coordinator` (usado por Vacancies/Contestations via
   *     User -> Teacher -> Coordinator para resolver `coordinatorId`).
   * Virar só o `typeUser` deixaria o novo coordenador sem registro
   * `Coordinator`, quebrando definição de vagas e resolução de contestações.
   * Por isso a transação também move o registro `Coordinator` e ajusta as
   * flags — tudo atômico, com rollback automático em caso de falha.
   */
  async transfer(currentUserId: number, targetTeacherId: number) {
    // 1. Resolve o coordenador atual pela cadeia User -> Teacher -> Coordinator.
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { teacher: { include: { coordinator: true } } },
    });

    if (!currentUser?.teacher?.coordinator) {
      // Tem typeUser COORDINATOR (passou no guard) mas sem registro coerente.
      throw new ForbiddenException(
        'Coordenador atual não possui registro de Coordinator vinculado.',
      );
    }

    const currentTeacherId = currentUser.teacher.id;
    const coordinatorId = currentUser.teacher.coordinator.id;

    // 2. Bloqueia transferência para si mesmo.
    if (targetTeacherId === currentTeacherId) {
      throw new BadRequestException(
        'Não é possível transferir a coordenação para você mesmo.',
      );
    }

    // 3. Valida o docente alvo: existe e é um TEACHER ativo.
    const targetTeacher = await this.prisma.teacher.findUnique({
      where: { id: targetTeacherId },
      include: { user: true },
    });

    if (!targetTeacher || !targetTeacher.user) {
      throw new NotFoundException('Docente alvo não encontrado.');
    }
    if (targetTeacher.user.typeUser !== 'TEACHER') {
      throw new BadRequestException(
        'O alvo da transferência precisa ser um docente (TEACHER) ativo.',
      );
    }

    const targetUserId = targetTeacher.userId;
    const auditDetails =
      `Transferência de coordenação: de userId=${currentUserId} ` +
      `(teacherId=${currentTeacherId}) para userId=${targetUserId} ` +
      `(teacherId=${targetTeacherId}).`;

    // 4. Transação atômica — se qualquer passo falhar, tudo sofre rollback.
    await this.prisma.$transaction([
      // Rebaixa o coordenador atual para TEACHER.
      this.prisma.user.update({
        where: { id: currentUserId },
        data: { typeUser: 'TEACHER' },
      }),
      this.prisma.teacher.update({
        where: { id: currentTeacherId },
        data: { isCoordinator: false },
      }),
      // Promove o alvo para COORDINATOR.
      this.prisma.user.update({
        where: { id: targetUserId },
        data: { typeUser: 'COORDINATOR' },
      }),
      this.prisma.teacher.update({
        where: { id: targetTeacherId },
        data: { isCoordinator: true },
      }),
      // Move o registro Coordinator para o novo docente, preservando os FKs
      // de Vacancy/Contestation (que apontam para este coordinatorId).
      this.prisma.coordinator.update({
        where: { id: coordinatorId },
        data: { teacherId: targetTeacherId },
      }),
      // Auditoria da ação (RF016/RF020): quem transferiu, para quem e quando.
      this.prisma.activityLog.create({
        data: {
          userId: currentUserId,
          action: 'TRANSFER_COORDINATION',
          details: auditDetails,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Coordenação transferida com sucesso.',
      from: { userId: currentUserId, teacherId: currentTeacherId },
      to: { userId: targetUserId, teacherId: targetTeacherId },
    };
  }
}
