import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
    @ApiProperty({ example: 1, description: 'ID do professor de destino' })
    @IsInt()
    @IsNotEmpty()
    teacherId: number;
}