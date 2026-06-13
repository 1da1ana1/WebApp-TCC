import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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

	async getTeacherStatsByUserId(userId: number, semesterId?: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: { teacher: true },
		});

		if (!user) {
			throw new NotFoundException('Usuário não encontrado.');
		}
		if (!user.teacher) {
			throw new BadRequestException('O usuário informado não é um docente.');
		}

		const teacherId = user.teacher.id;

		// Mesma lógica de cálculo do getTeacherStats — duplicada propositalmente
		// para não alterar o método existente (blindagem de escopo).
		const totalRequests = await this.prisma.request.count({ where: { teacherId } });

		const acceptedRequests = await this.prisma.request.count({
			where: { teacherId, status: 'ACCEPTED' },
		});

		const acceptanceRate = totalRequests > 0
			? Math.round((acceptedRequests / totalRequests) * 100)
			: 0;

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

	/**
	 * Resolve o filtro de período para WHEREs do Prisma.
	 * - semesterId: escopa orientações por semestre; solicitações ficam all-time
	 *   (Request não tem vínculo de semestre no schema).
	 * - from/to (YYYY-MM-DD): faixa em startDate (orientações) e sendDate
	 *   (solicitações). Comparação por instante UTC — sem fuso.
	 */
	private buildPeriodFilters(params: {
		from?: string;
		to?: string;
		semesterId?: number;
	}) {
		const { from, to, semesterId } = params;

		if (semesterId !== undefined) {
			return { orientationWhere: { semesterId }, requestWhere: {} };
		}

		const range: { gte?: Date; lte?: Date } = {};
		if (from) range.gte = new Date(`${from}T00:00:00.000Z`);
		if (to) range.lte = new Date(`${to}T23:59:59.999Z`);
		const hasRange = range.gte !== undefined || range.lte !== undefined;

		return {
			orientationWhere: hasRange ? { startDate: range } : {},
			requestWhere: hasRange ? { sendDate: range } : {},
		};
	}

	/**
	 * RF019 — contagem de orientandos por docente no período.
	 * Lista TODOS os docentes (inclusive com 0) para análise de distribuição.
	 */
	async getDistribution(params: { from?: string; to?: string; semesterId?: number }) {
		const { orientationWhere } = this.buildPeriodFilters(params);

		const teachers = await this.prisma.teacher.findMany({
			include: { user: { select: { name: true } } },
			orderBy: { id: 'asc' },
		});

		const rows: Array<{
			teacherId: number;
			teacherName: string;
			orientations: number;
			orientandos: number;
		}> = [];
		for (const teacher of teachers) {
			const orientations = await this.prisma.orientation.findMany({
				where: { supervisorId: teacher.id, ...orientationWhere },
				include: { students: { select: { id: true } } },
			});
			const orientandos = orientations.reduce(
				(sum, o) => sum + o.students.length,
				0,
			);
			rows.push({
				teacherId: teacher.id,
				teacherName: teacher.user?.name ?? '—',
				orientations: orientations.length,
				orientandos,
			});
		}

		rows.sort((a, b) => b.orientandos - a.orientandos);
		return { period: params, distribution: rows };
	}

	/** Linhas de estatísticas por docente, com o filtro de período aplicado. */
	private async getTeacherStatsRows(params: {
		from?: string;
		to?: string;
		semesterId?: number;
	}) {
		const { orientationWhere, requestWhere } = this.buildPeriodFilters(params);

		const teachers = await this.prisma.teacher.findMany({
			include: { user: { select: { name: true, email: true } } },
			orderBy: { id: 'asc' },
		});

		const rows: Array<{
			teacherId: number;
			teacherName: string;
			email: string;
			totalRequests: number;
			acceptedRequests: number;
			acceptanceRate: number;
			activeOrientations: number;
			completedOrientations: number;
		}> = [];
		for (const teacher of teachers) {
			const totalRequests = await this.prisma.request.count({
				where: { teacherId: teacher.id, ...requestWhere },
			});
			const acceptedRequests = await this.prisma.request.count({
				where: { teacherId: teacher.id, status: 'ACCEPTED', ...requestWhere },
			});
			const acceptanceRate =
				totalRequests > 0
					? Math.round((acceptedRequests / totalRequests) * 100)
					: 0;
			const activeOrientations = await this.prisma.orientation.count({
				where: { supervisorId: teacher.id, status: 'ACTIVE', ...orientationWhere },
			});
			const completedOrientations = await this.prisma.orientation.count({
				where: { supervisorId: teacher.id, status: 'COMPLETED', ...orientationWhere },
			});

			rows.push({
				teacherId: teacher.id,
				teacherName: teacher.user?.name ?? '',
				email: teacher.user?.email ?? '',
				totalRequests,
				acceptedRequests,
				acceptanceRate,
				activeOrientations,
				completedOrientations,
			});
		}
		return rows;
	}

	/**
	 * RF015 — estatísticas dos docentes em CSV. Geração manual (sem dependência
	 * extra). XLSX (exceljs) fica para depois, conforme o risco apontado.
	 */
	async getTeacherStatsCsv(params: { from?: string; to?: string; semesterId?: number }) {
		const rows = await this.getTeacherStatsRows(params);

		const headers = [
			'teacherId',
			'teacherName',
			'email',
			'totalRequests',
			'acceptedRequests',
			'acceptanceRate',
			'activeOrientations',
			'completedOrientations',
		];

		const escape = (value: unknown) => {
			const s = String(value ?? '');
			return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
		};

		const lines = [headers.join(',')];
		for (const row of rows) {
			lines.push(headers.map((h) => escape((row as Record<string, unknown>)[h])).join(','));
		}

		// BOM para o Excel reconhecer UTF-8 (acentos nos nomes).
		return '﻿' + lines.join('\r\n');
	}
}
