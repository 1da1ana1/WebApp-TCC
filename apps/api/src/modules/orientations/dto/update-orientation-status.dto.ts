import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Transição de status de uma orientação em andamento.
 * Apenas estados terminais são aceitos como destino — uma orientação
 * ACTIVE pode ser CONCLUÍDA ou CANCELADA. Voltar a ACTIVE não é permitido.
 */
export class UpdateOrientationStatusDto {
  @ApiProperty({ enum: ['COMPLETED', 'CANCELED'], example: 'COMPLETED' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['COMPLETED', 'CANCELED'])
  status: 'COMPLETED' | 'CANCELED';
}
