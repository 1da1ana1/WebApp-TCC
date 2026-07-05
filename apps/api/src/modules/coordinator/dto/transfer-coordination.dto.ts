import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

/**
 * Corpo de `POST /coordinator/transfer` (RF020).
 * `targetTeacherId` é o `Teacher.id` do docente que assumirá a coordenação.
 */
export class TransferCoordinationDto {
  @ApiProperty({
    example: 12,
    description: 'Teacher.id do docente que se tornará o novo coordenador',
  })
  @IsInt()
  @IsPositive()
  targetTeacherId: number;
}
