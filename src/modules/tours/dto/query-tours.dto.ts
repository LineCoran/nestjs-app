import { Transform, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Difficulty } from '../../../generated/prisma/enums';

/** Нормализует query-параметр в массив строк (поддержка `?x=a&x=b` и `?x=a,b`). */
const toStringArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v) => String(v).trim()).filter(Boolean);
};

export const SORT_OPTIONS = ['popular', 'new', 'old'] as const;
export type ToursSort = (typeof SORT_OPTIONS)[number];

export class QueryToursDto extends PaginationDto {
  /** Фильтр по слагу категории. */
  @IsOptional()
  @IsString()
  category?: string;

  /** Поиск по названию (для админки и каталога). */
  @IsOptional()
  @IsString()
  search?: string;

  /** Фильтр по сложности (можно несколько). */
  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(Difficulty, { each: true })
  difficulty?: Difficulty[];

  /** Фильтр по сезонам (строки сезона тура, напр. «июн-сен»). */
  @IsOptional()
  @Transform(toStringArray)
  @IsString({ each: true })
  seasons?: string[];

  /** Фильтр по форматам тура (TourPriceOption.formatName). */
  @IsOptional()
  @Transform(toStringArray)
  @IsString({ each: true })
  formats?: string[];

  /** Фильтр по особенностям (id из справочника TourFeature). */
  @IsOptional()
  @Transform(toStringArray)
  @IsString({ each: true })
  features?: string[];

  /** Диапазон длительности тура в днях. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMax?: number;

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

  /** Сортировка каталога. */
  @IsOptional()
  @IsIn(SORT_OPTIONS)
  sort?: ToursSort;

  /**
   * Фильтр публикации. Публичные эндпоинты всегда отдают только опубликованные,
   * этот параметр используется в админке.
   */
  @IsOptional()
  @IsBooleanString()
  @Transform(({ value }) => value)
  isPublished?: string;
}
