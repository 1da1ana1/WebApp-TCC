import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRequestResponseDto {
  @IsNotEmpty()
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  denialJustification?: string;
}
