import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  DateAvailability,
  Difficulty,
  ImportantInfoType,
  InclusionType,
} from '../../../generated/prisma/enums';

export class TourProgramItemDto {
  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  /** id тегов из справочника ProgramTag. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}

export class TourSessionDto {
  @IsISO8601()
  dateFrom: string;

  @IsISO8601()
  dateTo: string;

  @IsEnum(DateAvailability)
  availability: DateAvailability;

  /**
   * Формат тура, к которому относится заезд, — индекс в массиве `priceOptions`
   * этого же запроса. Не id: форматы при сохранении пересоздаются, их id
   * появляются только после вставки, поэтому связь идёт по позиции.
   * Не передан — заезд общий для всех форматов.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  priceOptionIndex?: number;
}

export class TourPriceOptionDto {
  @IsString()
  @IsNotEmpty()
  formatName: string;

  @IsInt()
  @Min(0)
  priceFrom: number;

  /** Продолжительность формата в днях. */
  @IsInt()
  @Min(1)
  durationDays: number;

  /** Размер группы текстом: «до 4 чел.» у джипа, «до 20 чел.» у автобуса. */
  @IsOptional()
  @IsString()
  groupSize?: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;
}

export class ImportantInfoItemDto {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ImportantInfoType)
  type: ImportantInfoType;
}

/** Привязка фичи из справочника к туру с типом «входит/не входит». */
export class TourFeatureLinkDto {
  @IsString()
  @IsNotEmpty()
  featureId: string;

  @IsEnum(InclusionType)
  inclusion: InclusionType;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateTourDto {
  @IsOptional()
  @IsString()
  slug?: string; // если не передан — сгенерируется из title

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  // Длительность, группа и сложность задаются у формата (priceOptions[]),
  // ближайшая дата считается из заездов — на уровне тура их нет.

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];

  @IsOptional()
  @IsString()
  aboutText?: string;

  /** Тег раннего бронирования на карточке, например «открыто бронирование на 2027». */
  @IsOptional()
  @IsString()
  earlyBooking?: string;

  /** Короткий вариант карточки — без цены. */
  @IsOptional()
  @IsBoolean()
  hidePrice?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;

  // ── Вложенные данные ──
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourProgramItemDto)
  program?: TourProgramItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourPriceOptionDto)
  priceOptions?: TourPriceOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourSessionDto)
  sessions?: TourSessionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportantInfoItemDto)
  importantInfo?: ImportantInfoItemDto[];

  // ── Привязки к справочникам ──
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourFeatureLinkDto)
  features?: TourFeatureLinkDto[];

  /** id пунктов из справочника «что взять с собой». */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatToTakeItemIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedTourIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
