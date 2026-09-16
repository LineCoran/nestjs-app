import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
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

export class UpdateCompanyInfoDto {
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
