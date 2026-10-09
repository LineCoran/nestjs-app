import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CompanyStatDto {
  @IsString()
  @IsNotEmpty()
  value: string; // например «6+»

  @IsString()
  @IsNotEmpty()
  label: string; // например «лет опыта»
}

export class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  platform: string; // telegram | vk | instagram | whatsapp | wechat | …

  @IsOptional()
  @IsString()
  label?: string; // «Канал» / «Группа» / «Аккаунт»

  @IsOptional()
  @IsString()
  value?: string; // отображаемый ник/название

  @IsOptional()
  @IsString()
  url?: string; // ссылка
}

/** Вид кнопки баннера — соответствует вариантам кнопок сайта. */
export const BANNER_BUTTON_STYLES = [
  'primary',
  'white',
  'dark',
  'outline-white',
  'outline-dark',
] as const;

export class BannerButtonDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @MaxLength(60)
  label: string;

  /** Путь на сайте («/tours», «/#booking») или внешняя ссылка «https://…». */
  @IsString()
  @MaxLength(500)
  link: string;

  @IsIn(BANNER_BUTTON_STYLES)
  style: (typeof BANNER_BUTTON_STYLES)[number];

  /** Стрелка → после текста. */
  @IsBoolean()
  arrow: boolean;
}

/**
 * Настройки баннера главной. Все поля обязательны: админка всегда шлёт баннер
 * целиком (со значениями по умолчанию), частичных правок нет.
 */
export class HomeBannerDto {
  @IsBoolean()
  enabled: boolean;

  /** Метка над заголовком: «— Начните свое приключение». */
  @IsString()
  @MaxLength(120)
  tag: string;

  @IsString()
  @MaxLength(160)
  title: string;

  @IsString()
  @MaxLength(400)
  description: string;

  @IsHexColor()
  backgroundColor: string;

  @IsHexColor()
  textColor: string;

  /** Высота на десктопе, px. На телефонах баннер подстраивается под контент. */
  @IsInt()
  @Min(240)
  @Max(900)
  height: number;

  /** Декор фона: круги у «Готовы увидеть Камчатку?», треугольники у сертификата. */
  @IsBoolean()
  decor: boolean;

  /** Анимация декора. */
  @IsBoolean()
  animated: boolean;

  /** Иконка-логотип справа (есть только у баннера сертификатов). */
  @IsBoolean()
  showLogo: boolean;

  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => BannerButtonDto)
  buttons: BannerButtonDto[];
}

export class HomeBannersDto {
  /** «Готовы увидеть Камчатку?» */
  @IsOptional()
  @ValidateNested()
  @Type(() => HomeBannerDto)
  cta?: HomeBannerDto;

  /** «Хотите подарить впечатления?» */
  @IsOptional()
  @ValidateNested()
  @Type(() => HomeBannerDto)
  gift?: HomeBannerDto;
}

export const CATALOG_DEFAULT_MODES = ['season', 'category', 'all'] as const;

/** Категория каталога по умолчанию; months — категория на каждый месяц (null — «Все туры»). */
export class CatalogDefaultDto {
  @IsIn(CATALOG_DEFAULT_MODES)
  mode: (typeof CATALOG_DEFAULT_MODES)[number];

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsObject()
  months?: Record<string, string | null>;
}

/** Пункт ленты «Как мы росли» на странице «О компании». */
export class CompanyHistoryItemDto {
  @IsString()
  @MaxLength(20)
  year: string; // «2026»

  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(600)
  text: string;

  /** Текущий этап: на сайте вместо точки — иконка-прицел. */
  @IsBoolean()
  current: boolean;
}

/** Тексты и фото страницы «О компании». Админка шлёт объект целиком. */
export class CompanyPageDto {
  @IsString()
  @MaxLength(80)
  philosophyTag: string; // «— Философия»

  @IsString()
  @MaxLength(160)
  philosophyTitle: string;

  /** Абзацы через пустую строку. */
  @IsString()
  @MaxLength(3000)
  philosophyText: string;

  /** Путь загруженного фото; пустая строка — стандартное фото сайта. */
  @IsString()
  @MaxLength(500)
  philosophyImage: string;

  @IsString()
  @MaxLength(80)
  historyTag: string; // «— История»

  @IsString()
  @MaxLength(160)
  historyTitle: string; // «Как мы росли»
}

export class UpdateCompanyInfoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyPageDto)
  companyPage?: CompanyPageDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CompanyHistoryItemDto)
  history?: CompanyHistoryItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogDefaultDto)
  catalogDefault?: CatalogDefaultDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HomeBannersDto)
  banners?: HomeBannersDto;

  @IsOptional()
  @IsString()
  aboutText?: string;

  @IsOptional()
  @IsString()
  aboutImage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyStatDto)
  stats?: CompanyStatDto[];

  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  heroImage?: string;

  /** Обложка плашки «Все туры» в каталоге; пустая строка — запасная картинка. */
  @IsOptional()
  @IsString()
  catalogImage?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  telegramLink?: string;

  @IsOptional()
  @IsString()
  vkLink?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  workingDays?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  registryNumber?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  directorName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  inn?: string;

  @IsOptional()
  @IsString()
  kpp?: string;

  @IsOptional()
  @IsString()
  ogrn?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  settlementAccount?: string;

  @IsOptional()
  @IsString()
  correspondentAccount?: string;

  @IsOptional()
  @IsString()
  bic?: string;
}
