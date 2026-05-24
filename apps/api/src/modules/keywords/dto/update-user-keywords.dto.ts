import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class UpdateUserKeywordsDto {
  @ApiProperty({
    type: [Number],
    example: [1, 4, 7],
    description: 'IDs das keywords a vincular ao usuário autenticado (máximo 5).',
  })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  keywordIds: number[];
}