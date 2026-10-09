import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWhatToTakeCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Имя lucide-иконки (kebab-case) из каталога иконок; пустая строка — без иконки. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;
}

export class UpdateWhatToTakeCategoryDto extends PartialType(
  CreateWhatToTakeCategoryDto,
) {}

export class CreateWhatToTakeItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  /** Имя lucide-иконки (kebab-case) из каталога иконок; пустая строка — без иконки. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;
}

export class UpdateWhatToTakeItemDto extends PartialType(
  CreateWhatToTakeItemDto,
) {}
