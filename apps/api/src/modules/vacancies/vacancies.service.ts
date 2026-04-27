import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VacanciesService {
	constructor(private readonly prisma: PrismaService) {}

	async defineVacancies(userId: number, quantity: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { teacher: true },
		});

		if (!user || !user.teacher) {
			throw new ForbiddenException('Apenas professores podem definir vagas.');
		}

		const activeSemester = await this.prisma.semester.findFirst({
			where: { isActive: true },
		});

		if (!activeSemester) {
			throw new NotFoundException(
				'Nenhum semestre ativo no momento. A coordenação precisa abrir um semestre primeiro.',
			);
		}

		const coordinator = await this.prisma.coordinator.findFirst({
			orderBy: { id: 'asc' },
		});

		if (!coordinator) {
			throw new NotFoundException(
				'Nenhum coordenador cadastrado para vincular a vaga.',
			);
		}

		return this.prisma.vacancy.create({
			data: {
				quantity,
				teacherId: user.teacher.id,
				semesterId: activeSemester.id,
				coordinatorId: coordinator.id,
			},
		});
	}

	async getTeacherVacancies(teacherId: number) {
		return this.prisma.vacancy.findMany({
			where: { teacherId },
			include: { semester: true },
			orderBy: { id: 'desc' },
		});
	}
}
