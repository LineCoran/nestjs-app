import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
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

export class UpdateCompanyInfoDto {
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
