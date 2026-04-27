import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

	@ApiPropertyOptional({ example: '2026-01-10T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	vacancyDefStartDate?: string;

	@ApiPropertyOptional({ example: '2026-01-30T23:59:59.000Z' })
	@IsDateString()
	@IsOptional()
	vacancyDefEndDate?: string;

	@ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
	@IsDateString()
	@IsOptional()
	searchStartDate?: string;

	@ApiPropertyOptional({ example: '2026-03-15T23:59:59.000Z' })
	@IsDateString()
	@IsOptional()
	searchEndDate?: string;
}
