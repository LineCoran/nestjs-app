import { Transform, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Difficulty } from '../../../generated/prisma/enums';

export class QueryToursDto extends PaginationDto {
  /** Фильтр по слагу категории. */
  @IsOptional()
  @IsString()
  category?: string;

  /** Поиск по названию (для админки и каталога). */
  @IsOptional()
  @IsString()
  search?: string;

  /** Фильтр по сложности. */
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  /** Диапазон цены «от» (по минимальному priceFrom среди форматов). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  /**
   * Фильтр публикации. Публичные эндпоинты всегда отдают только опубликованные,
   * этот параметр используется в админке.
   */
  @IsOptional()
  @IsBooleanString()
  @Transform(({ value }) => value)
  isPublished?: string;
}
