import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestResponseDto {
  @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'], example: 'ACCEPTED' })
  @IsNotEmpty()
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: string;

  @ApiPropertyOptional({ example: 'Perfil não aderente ao tema', description: 'Obrigatório quando status=REJECTED' })
  @IsOptional()
  @IsString()
  denialJustification?: string;
}
