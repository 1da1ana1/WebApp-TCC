import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';

@Injectable()
export class SemestersService {
	constructor(private readonly prisma: PrismaService) {}

	async createSemester(userId: number, data: CreateSemesterDto) {
		// Validação de papel agora é feita pelo RolesGuard no controller
		// (@Roles('COORDINATOR')). Mantemos apenas as regras de domínio.
		void userId;

		if (data.isActive) {
			await this.prisma.semester.updateMany({
				data: { isActive: false },
			});
		}

		return this.prisma.semester.create({
			data: {
				...data,
				vacancyDefStartDate: data.vacancyDefStartDate
					? new Date(data.vacancyDefStartDate)
					: undefined,
				vacancyDefEndDate: data.vacancyDefEndDate
					? new Date(data.vacancyDefEndDate)
					: undefined,
				searchStartDate: data.searchStartDate
					? new Date(data.searchStartDate)
					: undefined,
				searchEndDate: data.searchEndDate ? new Date(data.searchEndDate) : undefined,
			},
		});
	}

	async getActiveSemester() {
		return this.prisma.semester.findFirst({
			where: { isActive: true },
		});
	}

	async listSemesters() {
		// Mais recente primeiro — alimenta o dropdown de filtro de estatísticas.
		return this.prisma.semester.findMany({
			orderBy: [{ year: 'desc' }, { period: 'desc' }],
		});
	}
}
