import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateSemesterDto {
	@IsInt()
	year: number;

	@IsString()
	period: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@IsDateString()
	@IsOptional()
	vacancyDefStartDate?: string;

	@IsDateString()
	@IsOptional()
	vacancyDefEndDate?: string;

	@IsDateString()
	@IsOptional()
	searchStartDate?: string;

	@IsDateString()
	@IsOptional()
	searchEndDate?: string;
}
