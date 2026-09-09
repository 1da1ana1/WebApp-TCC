import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ATENÇÃO: o ValidationPipe global roda com `whitelist: true`, então todo campo
 * que não estiver declarado aqui é REMOVIDO do body sem erro nenhum — a
 * requisição responde 201 e a data simplesmente não é gravada.
 *
 * Por isso este DTO declara as 13 datas do model Semester. Ao criar uma etapa
 * nova no cronograma, o campo precisa entrar em três lugares, ou ele nunca
 * chega às telas:
 *   1. model Semester (prisma/schema.prisma)
 *   2. este DTO
 *   3. STEP_DEFINITIONS (apps/web/src/stores/timelineData.js)
 */
export class CreateSemesterDto {
	@ApiProperty({ example: 2026 })
	@IsInt()
	year: number;

	@ApiProperty({ example: '1' })
	@IsString()
	period: string;

	@ApiPropertyOptional({ example: true })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	// ── Definição de vagas ──────────────────────────────────────────
	@ApiPropertyOptional({ example: '2026-01-10T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	vacancyDefStartDate?: string;

	@ApiPropertyOptional({ example: '2026-01-30T23:59:59.999Z' })
	@IsDateString()
	@IsOptional()
	vacancyDefEndDate?: string;

	// ── Cadastro de temas ───────────────────────────────────────────
	@ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	themeRegStartDate?: string;

	@ApiPropertyOptional({ example: '2026-02-15T23:59:59.999Z' })
	@IsDateString()
	@IsOptional()
	themeRegEndDate?: string;

	// ── Período de busca ────────────────────────────────────────────
	@ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	searchStartDate?: string;

	@ApiPropertyOptional({ example: '2026-03-15T23:59:59.999Z' })
	@IsDateString()
	@IsOptional()
	searchEndDate?: string;

	// ── Análise das solicitações ────────────────────────────────────
	@ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	analysisStartDate?: string;

	@ApiPropertyOptional({ example: '2026-04-15T23:59:59.999Z' })
	@IsDateString()
	@IsOptional()
	analysisEndDate?: string;

	// ── Confirmação de vínculo ──────────────────────────────────────
	@ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	linkConfirmStartDate?: string;

	@ApiPropertyOptional({ example: '2026-05-15T23:59:59.999Z' })
	@IsDateString()
	@IsOptional()
	linkConfirmEndDate?: string;

	// ── Etapas de fase única (só data de início) ────────────────────
	@ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	orientationStartDate?: string;

	@ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	homologationDate?: string;

	@ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	closureDate?: string;
}
