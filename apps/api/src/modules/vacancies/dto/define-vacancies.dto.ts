import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class DefineVacanciesDto {
  @ApiProperty({
    description: 'ID do docente que receberá as vagas.',
    example: 7,
  })
  @IsInt()
  @Min(1)
  teacherId: number;

  @ApiProperty({
    description: 'Quantidade de vagas a serem definidas para o docente.',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description:
      'ID do semestre alvo. Se omitido, o serviço usa o semestre atualmente ativo (isActive=true).',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  semesterId?: number;
}
