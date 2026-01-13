import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSolicitacaoDto {
    @IsNumber()
    @IsNotEmpty()
    teacherId: number;

    @IsNumber()
    @IsNotEmpty()
    studentId: number;
}