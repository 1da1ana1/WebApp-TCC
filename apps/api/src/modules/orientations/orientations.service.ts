import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Máquina de estados das orientações (RF014). Só há transições saindo de
 * ACTIVE; COMPLETED e CANCELED são terminais (nenhuma transição de saída).
 * Isso impede pular etapas (ex.: reabrir uma orientação encerrada) ou
 * re-finalizar uma já finalizada.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
	ACTIVE: ['COMPLETED', 'CANCELED'],
	COMPLETED: [],
	CANCELED: [],
};

@Injectable()
export class OrientationsService {
	constructor(private prisma: PrismaService) {}

	async getMyOrientations(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { student: true, teacher: true },
		});

		if (!user) {
			throw new ForbiddenException('Usuário não encontrado.');
		}

		if (user.typeUser === 'STUDENT' && user.student) {
			return this.prisma.orientation.findMany({
				where: { students: { some: { id: user.student.id } } },
				include: { supervisor: { include: { user: true } } },
				orderBy: { startDate: 'desc' },
			});
		}

		if ((user.typeUser === 'TEACHER' || user.typeUser === 'COORDINATOR') && user.teacher) {
			return this.prisma.orientation.findMany({
				where: { supervisorId: user.teacher.id },
				include: { students: { include: { user: true } } },
				orderBy: { startDate: 'desc' },
			});
		}

		return [];
	}

	/**
	 * Transiciona o status de uma orientação para COMPLETED ou CANCELED.
	 *
	 * Autorização: só o TEACHER dono (supervisor) da orientação ou um
	 * COORDINATOR (que pode agir sobre qualquer orientação). A restrição de
	 * papel já é aplicada pelo RolesGuard no controller; aqui validamos a
	 * posse para o caso TEACHER.
	 *
	 * Transições seguem RF014 (ver ALLOWED_TRANSITIONS) — origem precisa ser
	 * ACTIVE. Toda mudança é registrada em ActivityLog para auditoria.
	 */
	async updateStatus(
		userId: number,
		typeUser: string,
		orientationId: number,
		newStatus: 'COMPLETED' | 'CANCELED',
	) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { teacher: true },
		});

		if (!user || !user.teacher) {
			throw new ForbiddenException(
				'Apenas docentes ou coordenadores podem alterar orientações.',
			);
		}

		const orientation = await this.prisma.orientation.findUnique({
			where: { id: orientationId },
		});

		if (!orientation) {
			throw new NotFoundException('Orientação não encontrada.');
		}

		// COORDINATOR pode agir sobre qualquer orientação; TEACHER só sobre as
		// que supervisiona.
		if (
			typeUser !== 'COORDINATOR' &&
			orientation.supervisorId !== user.teacher.id
		) {
			throw new ForbiddenException(
				'Você só pode alterar orientações das quais é o orientador.',
			);
		}

		// Validação de transição (RF014).
		const currentStatus = orientation.status;
		const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
		if (!allowed.includes(newStatus)) {
			throw new BadRequestException(
				`Transição inválida: não é possível mudar de ${currentStatus} para ${newStatus}.`,
			);
		}

		// Persiste a mudança e o log de auditoria atomicamente.
		const [updated] = await this.prisma.$transaction([
			this.prisma.orientation.update({
				where: { id: orientationId },
				data: {
					status: newStatus,
					endDate: new Date(), // ambos COMPLETED e CANCELED encerram a orientação
				},
			}),
			this.prisma.activityLog.create({
				data: {
					userId,
					action: `ORIENTATION_${newStatus}#${orientationId}`,
				},
			}),
		]);

		return updated;
	}
}
