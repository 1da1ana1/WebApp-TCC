import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';

/**
 * Todas as datas do cronograma, na ordem em que aparecem na linha do tempo.
 * Converter a lista inteira de uma vez evita o bug de alguém acrescentar uma
 * etapa no DTO e esquecer de convertê-la aqui.
 */
const DATE_FIELDS = [
	'vacancyDefStartDate',
	'vacancyDefEndDate',
	'themeRegStartDate',
	'themeRegEndDate',
	'searchStartDate',
	'searchEndDate',
	'analysisStartDate',
	'analysisEndDate',
	'linkConfirmStartDate',
	'linkConfirmEndDate',
	'orientationStartDate',
	'homologationDate',
	'closureDate',
] as const satisfies readonly (keyof CreateSemesterDto)[];

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

		// `string` (ISO 8601, validado pelo @IsDateString) → `Date`.
		const dates: Record<string, Date | undefined> = {};
		for (const field of DATE_FIELDS) {
			const value = data[field];
			dates[field] = value ? new Date(value) : undefined;
		}

		return this.prisma.semester.create({
			data: {
				...data,
				...dates,
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
