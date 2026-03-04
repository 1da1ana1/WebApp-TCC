import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRequestDto {
    @IsNumber()
    @IsNotEmpty()
    teacherId: number;

    @IsNumber()
    @IsNotEmpty()
    studentId: number;
}