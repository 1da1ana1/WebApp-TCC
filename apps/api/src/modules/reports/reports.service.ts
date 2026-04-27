import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportsService {
	constructor(private prisma: PrismaService) {}

	async getTeacherStats(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { teacher: true },
		});

		if (!user || !user.teacher) {
			throw new ForbiddenException('Apenas professores possuem estatísticas.');
		}

		const teacherId = user.teacher.id;

		const totalRequests = await this.prisma.request.count({
			where: { teacherId },
		});

		const acceptedRequests = await this.prisma.request.count({
			where: { teacherId, status: 'ACCEPTED' },
		});

		const acceptanceRate = totalRequests > 0
			? Math.round((acceptedRequests / totalRequests) * 100)
			: 0;

		const activeOrientations = await this.prisma.orientation.count({
			where: { supervisorId: teacherId, status: 'ACTIVE' },
		});

		const completedOrientations = await this.prisma.orientation.count({
			where: { supervisorId: teacherId, status: 'COMPLETED' },
		});

		return {
			totalRequests,
			acceptedRequests,
			acceptanceRate: `${acceptanceRate}%`,
			activeOrientations,
			completedOrientations,
		};
	}

	async getCoordinatorStats(userId: number) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });

		if (user?.typeUser !== 'COORDINATOR') {
			throw new ForbiddenException(
				'Apenas coordenadores podem acessar os relatórios gerais.',
			);
		}

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
