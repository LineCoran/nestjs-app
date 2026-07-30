import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class GuideTagDto {
  @IsString()
  @IsNotEmpty()
  label: string; // например «Альпинизм»

  @IsOptional()
  @IsString()
  icon?: string; // kebab-case имя иконки lucide, например «mountain»
}

export class CreateGuideDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  /** Короткое описание — карточка на главной и в «Команде». */
  @IsOptional()
  @IsString()
  description?: string;

  /** Развёрнутое описание — страница «О нас». */
  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideTagDto)
  tags?: GuideTagDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateGuideDto extends PartialType(CreateGuideDto) {}
