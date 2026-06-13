import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DefineVacanciesDto } from './dto/define-vacancies.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VacanciesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notifications: NotificationsService,
	) {}

	async defineVacancies(userId: number, dto: DefineVacanciesDto) {
		// 1. A validação de typeUser === 'COORDINATOR' já acontece no
		//    RolesGuard (controller). Aqui só precisamos resolver o
		//    coordinatorId via cadeia User -> Teacher -> Coordinator,
		//    que o guard não tem como inspecionar.
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				teacher: { include: { coordinator: true } },
			},
		});

		if (!user?.teacher?.coordinator) {
			throw new ForbiddenException(
				'Usuário com papel COORDINATOR não possui registro de Coordinator vinculado.',
			);
		}

		const coordinatorId = user.teacher.coordinator.id;

		// 3. Garante que o docente alvo existe antes de tocar no banco.
		const targetTeacher = await this.prisma.teacher.findUnique({
			where: { id: dto.teacherId },
		});
		if (!targetTeacher) {
			throw new NotFoundException(
				`Docente com id ${dto.teacherId} não encontrado.`,
			);
		}

		// 4. Resolve o semestre: o do body, ou o ativo como fallback.
		const semesterId = await this.resolveSemesterId(dto.semesterId);

		// 5. Evita duplicidade. Não há @@unique([teacherId, semesterId]) no
		//    schema, então um upsert do Prisma seria ambíguo — usamos
		//    findFirst e decidimos entre update/create manualmente.
		const existing = await this.prisma.vacancy.findFirst({
			where: { teacherId: dto.teacherId, semesterId },
		});

		const vacancy = existing
			? await this.prisma.vacancy.update({
					where: { id: existing.id },
					data: {
						quantity: dto.quantity,
						coordinatorId,
					},
				})
			: await this.prisma.vacancy.create({
					data: {
						quantity: dto.quantity,
						teacherId: dto.teacherId,
						semesterId,
						coordinatorId,
					},
				});

		// Notifica o docente sobre a definição de vagas (best-effort).
		await this.notifications.notify({
			userId: targetTeacher.userId,
			type: 'VACANCY_DEFINED',
			title: 'Vagas definidas',
			body: `A coordenação definiu ${dto.quantity} vaga(s) para você neste semestre.`,
			link: '/perfil/docente',
		});

		return vacancy;
	}

	async getTeacherVacancies(teacherId: number) {
		return this.prisma.vacancy.findMany({
			where: { teacherId },
			include: { semester: true },
			orderBy: { id: 'desc' },
		});
	}

	private async resolveSemesterId(
		requested: number | undefined,
	): Promise<number> {
		if (requested !== undefined && requested !== null) {
			const semester = await this.prisma.semester.findUnique({
				where: { id: requested },
			});
			if (!semester) {
				throw new NotFoundException(
					`Semestre com id ${requested} não encontrado.`,
				);
			}
			return semester.id;
		}

		const activeSemester = await this.prisma.semester.findFirst({
			where: { isActive: true },
		});
		if (!activeSemester) {
			throw new NotFoundException(
				'Nenhum semestre ativo. Abra um semestre antes de definir vagas.',
			);
		}
		return activeSemester.id;
	}
}
