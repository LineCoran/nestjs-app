import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  rating: number;
}