import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Resolução de uma contestação pelo coordenador (RF018).
 * Em ACCEPTED, `newQuantity` é obrigatório e passa a ser a nova
 * Vacancy.quantity. `justification` é aceito para a recusa, mas hoje não há
 * campo no schema para persisti-lo (documentado no service).
 */
export class ResolveContestationDto {
  @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'], example: 'ACCEPTED' })
  @IsNotEmpty()
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: 'ACCEPTED' | 'REJECTED';

  @ApiPropertyOptional({
    example: 4,
    description: 'Nova quantidade de vagas — obrigatório quando status=ACCEPTED.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  newQuantity?: number;

  @ApiPropertyOptional({
    example: 'Sem saldo de vagas no curso.',
    description: 'Motivo da recusa (não persistido — sem campo no schema).',
  })
  @IsOptional()
  @IsString()
  justification?: string;
}
