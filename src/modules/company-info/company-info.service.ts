import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import {
  CatalogDefaultDto,
  CompanyPageDto,
  UpdateCompanyInfoDto,
} from './dto/company-info.dto';

/** Оставляет только известные поля страницы «О компании». */
function sanitizeCompanyPage(dto: CompanyPageDto) {
  return {
    philosophyTag: dto.philosophyTag,
    philosophyTitle: dto.philosophyTitle,
    philosophyText: dto.philosophyText,
    philosophyImage: dto.philosophyImage,
    historyTag: dto.historyTag,
    historyTitle: dto.historyTitle,
  };
}

/** Оставляет только месяцы 1–12 со строковым id категории или null («Все туры»). */
function sanitizeCatalogDefault(dto: CatalogDefaultDto) {
  const months: Record<string, string | null> = {};
  for (let m = 1; m <= 12; m++) {
    const value = dto.months?.[String(m)];
    months[m] = typeof value === 'string' && value ? value : null;
  }
  return {
    mode: dto.mode,
    categoryId: dto.categoryId || null,
    months,
  };
}

@Injectable()
export class CompanyInfoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Singleton: всегда возвращает единственную запись, создавая её при необходимости. */
  async get() {
    const existing = await this.prisma.companyInfo.findFirst();
    if (existing) return existing;
    return this.prisma.companyInfo.create({ data: {} });
  }

  async update(dto: UpdateCompanyInfoDto) {
    const current = await this.get();
    return this.prisma.companyInfo.update({
      where: { id: current.id },
      data: {
        aboutText: dto.aboutText,
        aboutImage: dto.aboutImage,
        stats:
          dto.stats !== undefined
            ? (dto.stats as unknown as Prisma.InputJsonValue)
            : undefined,
        heroTitle: dto.heroTitle,
        heroSubtitle: dto.heroSubtitle,
        heroImage: dto.heroImage,
        catalogImage: dto.catalogImage,
        companyPage:
          dto.companyPage !== undefined
            ? sanitizeCompanyPage(dto.companyPage)
            : undefined,
        history:
          dto.history !== undefined
            ? dto.history.map(({ year, title, text, current }) => ({
                year,
                title,
                text,
                current,
              }))
            : undefined,
        catalogDefault:
          dto.catalogDefault !== undefined
            ? sanitizeCatalogDefault(dto.catalogDefault)
            : undefined,
        contactPhone: dto.contactPhone,
        telegramLink: dto.telegramLink,
        vkLink: dto.vkLink,
        phones: dto.phones,
        socialLinks:
          dto.socialLinks !== undefined
            ? (dto.socialLinks as unknown as Prisma.InputJsonValue)
            : undefined,
        region: dto.region,
        city: dto.city,
        workingDays: dto.workingDays,
        workingHours: dto.workingHours,
        registryNumber: dto.registryNumber,
        legalName: dto.legalName,
        directorName: dto.directorName,
        email: dto.email,
        address: dto.address,
        website: dto.website,
        inn: dto.inn,
        kpp: dto.kpp,
        ogrn: dto.ogrn,
        bankName: dto.bankName,
        settlementAccount: dto.settlementAccount,
        correspondentAccount: dto.correspondentAccount,
        bic: dto.bic,
        // Баннеры приходят целиком — сливаем по ключам, чтобы правка одного
        // баннера не стирала другой.
        banners:
          dto.banners !== undefined
            ? {
                ...((current.banners as Record<string, unknown>) ?? {}),
                // undefined-ключи (баннер не прислали) не затирают сохранённый.
                ...Object.fromEntries(
                  Object.entries(dto.banners).filter(
                    ([, v]) => v !== undefined,
                  ),
                ),
              }
            : undefined,
      },
    });
  }
}
