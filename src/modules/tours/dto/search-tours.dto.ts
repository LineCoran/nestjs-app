import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Параметры «умного» поиска по турам (шапка сайта). */
export class SearchToursDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  q: string;

  /** Сколько туров вернуть (для выпадашки хватает 5-8). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 8;
}
