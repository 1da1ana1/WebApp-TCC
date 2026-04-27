import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

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
}
