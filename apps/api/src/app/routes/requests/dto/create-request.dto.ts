import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateRequestDto {
    @IsInt()
    @IsNotEmpty()
    teacherId: number;
}