import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListTeachersQueryDto {
  @ApiPropertyOptional({
    example: 'silva',
    description: 'Busca por trecho do nome (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Inteligência Artificial,Redes de Computadores',
    description:
      'Nomes de keywords separados por vírgula. Match exato (Prisma `in`), case-sensitive.',
  })
  @IsOptional()
  @IsString()
  keywords?: string;
}