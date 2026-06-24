import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string; // если пусто — сгенерируется из name

  @IsOptional()
  @IsString()
  image?: string; // URL обложки категории
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
