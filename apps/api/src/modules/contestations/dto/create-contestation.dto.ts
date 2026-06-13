import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Criação de uma contestação de vagas pelo docente (RF018).
 * O docente só informa o motivo — a vaga, o semestre e o coordenador são
 * resolvidos no servidor a partir do semestre ativo e da vaga do docente.
 */
export class CreateContestationDto {
  @ApiProperty({
    example:
      'Recebi apenas 2 vagas, mas tenho 5 alunos aptos aguardando orientação.',
    description: 'Justificativa da contestação.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  contestationReason: string;
}
