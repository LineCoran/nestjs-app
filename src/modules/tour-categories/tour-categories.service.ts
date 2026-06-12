import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ensureUniqueSlug } from '../../common/utils/slug.util';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class TourCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Список категорий с количеством опубликованных туров (для фильтров). */
  async findAll() {
    const categories = await this.prisma.tourCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tours: { where: { isPublished: true } } } },
      },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      toursCount: _count.tours,
    }));
  }

  async create(dto: CreateCategoryDto) {
    const slug = await ensureUniqueSlug(dto.slug || dto.name, (s) =>
      this.slugExists(s),
    );
    return this.prisma.tourCategory.create({ data: { name: dto.name, slug } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.getOrThrow(id);

    const slug =
      dto.slug !== undefined
        ? await ensureUniqueSlug(dto.slug || dto.name || id, (s) =>
            this.slugExists(s, id),
          )
        : undefined;

    return this.prisma.tourCategory.update({
      where: { id },
      data: { name: dto.name, ...(slug ? { slug } : {}) },
    });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.tourCategory.delete({ where: { id } });
    return { success: true };
  }

  private async getOrThrow(id: string) {
    const category = await this.prisma.tourCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }
    return category;
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const found = await this.prisma.tourCategory.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!found && found.id !== exceptId;
  }
}
