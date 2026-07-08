import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { UpdateCompanyInfoDto } from './dto/company-info.dto';

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
        contactPhone: dto.contactPhone,
        telegramLink: dto.telegramLink,
        vkLink: dto.vkLink,
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
      },
    });
  }
}
