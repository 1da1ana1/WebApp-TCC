import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportsService {
	constructor(private prisma: PrismaService) {}

	async getTeacherStats(userId: number, semesterId?: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { teacher: true },
		});

		if (!user || !user.teacher) {
			throw new ForbiddenException('Apenas professores possuem estatísticas.');
		}

		const teacherId = user.teacher.id;

		// Solicitações não têm vínculo com semestre no schema (Request.semesterId
		// não existe), então essas métricas são sempre totais (all-time). A UI
		// sinaliza isso ao usuário.
		const totalRequests = await this.prisma.request.count({
			where: { teacherId },
		});

		const acceptedRequests = await this.prisma.request.count({
			where: { teacherId, status: 'ACCEPTED' },
		});

		const acceptanceRate = totalRequests > 0
			? Math.round((acceptedRequests / totalRequests) * 100)
			: 0;

		// Orientações têm semesterId — quando informado, escopa por semestre.
		const semesterFilter = semesterId !== undefined ? { semesterId } : {};

		const activeOrientations = await this.prisma.orientation.count({
			where: { supervisorId: teacherId, status: 'ACTIVE', ...semesterFilter },
		});

		const completedOrientations = await this.prisma.orientation.count({
			where: { supervisorId: teacherId, status: 'COMPLETED', ...semesterFilter },
		});

		return {
			totalRequests,
			acceptedRequests,
			acceptanceRate: `${acceptanceRate}%`,
			activeOrientations,
			completedOrientations,
			semesterId: semesterId ?? null,
		};
	}

	async getCoordinatorStats(userId: number) {
		// Validação de papel feita pelo RolesGuard (@Roles('COORDINATOR')).
		void userId;

		const totalStudents = await this.prisma.student.count();

		const studentsWithOrientation = await this.prisma.orientation.count({
			where: { status: 'ACTIVE' },
		});

		const studentsWithoutOrientation = totalStudents - studentsWithOrientation;

		const overloadedTeachers = await this.prisma.teacher.findMany({
			include: {
				user: { select: { name: true } },
				_count: {
					select: {
						attendedRequests: {
							where: { status: 'REJECTED' },
						},
					},
				},
			},
			orderBy: {
				attendedRequests: { _count: 'desc' },
			},
			take: 5,
		});

		return {
			totalStudents,
			studentsWithOrientation,
			studentsWithoutOrientation,
			overloadedTeachers: overloadedTeachers.map((teacher) => ({
				name: teacher.user.name,
				rejections: teacher._count.attendedRequests,
			})),
		};
	}
}
