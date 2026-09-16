import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateSiteIconDto {
  /** kebab-case имя иконки lucide: «mountain», «map-pin». */
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Имя иконки — латиница и цифры через дефис, например «map-pin»',
  })
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;
}

export class UpdateSiteIconDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;
}

/**
 * Каталог иконок сайта. Из него админка предлагает иконки в выборах
 * (теги гидов, услуги), вместо всех ~1700 иконок библиотеки.
 * Удаление из каталога не трогает уже выбранные иконки — они продолжают
 * отображаться на сайте.
 */
@Injectable()
export class SiteIconsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.siteIcon.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async create(dto: CreateSiteIconDto) {
    const exists = await this.prisma.siteIcon.findUnique({
      where: { name: dto.name },
    });
    if (exists) {
      throw new ConflictException(`Иконка «${dto.name}» уже есть в каталоге`);
    }
    return this.prisma.siteIcon.create({
      data: { name: dto.name, label: dto.label?.trim() || null },
    });
  }

  async update(id: string, dto: UpdateSiteIconDto) {
    await this.getOrThrow(id);
    return this.prisma.siteIcon.update({
      where: { id },
      data: { label: dto.label?.trim() || null },
    });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.siteIcon.delete({ where: { id } });
    return { success: true };
  }

  private async getOrThrow(id: string) {
    const found = await this.prisma.siteIcon.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Иконка с ID ${id} не найдена`);
    return found;
  }
}
