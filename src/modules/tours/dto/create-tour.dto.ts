import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  DateAvailability,
  Difficulty,
  ImportantInfoType,
  InclusionType,
  Transport,
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
   */
  @IsInt()
  @Min(0)
  priceOptionIndex: number;
}

export class TourPriceOptionDto {
  @IsString()
  @IsNotEmpty()
  formatName: string;

  @IsInt()
  @Min(0)
  priceFrom: number;

  /** «от» перед ценой на сайте; false — цена точная. Не передан — «от». */
  @IsOptional()
  @IsBoolean()
  priceIsFrom?: boolean;

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

  /** Транспорт формата — для фильтра «Транспорт» в каталоге; не передан — не указан. */
  @IsOptional()
  @IsEnum(Transport)
  transport?: Transport | null;
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

/** Лимиты пункта плашки характеристик — длиннее не помещается в плитку макета. */
export const TOUR_HIGHLIGHT_LIMITS = {
  items: 5,
  title: 18,
  value: 12,
  label: 22,
} as const;

/** Пункт плашки характеристик под заголовком тура: «Группа / 8-12 чел. / или индив.». */
export class TourHighlightDto {
  /** Имя lucide-иконки (kebab-case) из каталога иконок. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(TOUR_HIGHLIGHT_LIMITS.title)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(TOUR_HIGHLIGHT_LIMITS.value)
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(TOUR_HIGHLIGHT_LIMITS.label)
  label?: string;
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
  subtitle?: string | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  // Длительность, группа и сложность задаются у формата (priceOptions[]),
  // ближайшая дата считается из заездов — на уровне тура их нет.

  @IsOptional()
  @IsString()
  season?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];

  /** Плашка характеристик под заголовком; пустой массив — блок не показывается. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TOUR_HIGHLIGHT_LIMITS.items)
  @ValidateNested({ each: true })
  @Type(() => TourHighlightDto)
  highlights?: TourHighlightDto[];

  @IsOptional()
  @IsString()
  aboutText?: string | null;

  /** Тег раннего бронирования на карточке, например «открыто бронирование на 2027». */
  @IsOptional()
  @IsString()
  earlyBooking?: string | null;

  /** Примечание «со звёздочкой» под «Что входит»; null — убрать. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  includedNote?: string | null;

  /** Примечание «со звёздочкой» под «Что не входит»; null — убрать. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  excludedNote?: string | null;

  /** Примечание «со звёздочкой» под «Что взять с собой»; null — убрать. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  whatToTakeNote?: string | null;

  /**
   * Белый бейдж на карточке тура: «Лето», «с 2027 года». Пусто — на карточке
   * сезон. Отдельно от season: по сезону работает фильтр каталога.
   * null — очистить.
   */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  seasonLabel?: string | null;

  /** Короткий вариант карточки — без цены. */
  @IsOptional()
  @IsBoolean()
  hidePrice?: boolean;

  /** Метка «новинка» в плашке с ценой на карточке. */
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

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
