import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { ensureUniqueSlug } from '../../common/utils/slug.util';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { QueryToursDto } from './dto/query-tours.dto';

/** Полный набор связей для детальной страницы тура. */
const TOUR_DETAIL_INCLUDE = {
  category: true,
  program: { include: { tags: true }, orderBy: { order: 'asc' } },
  priceOptions: true,
  sessions: { orderBy: { dateFrom: 'asc' } },
  importantInfo: { orderBy: { order: 'asc' } },
  features: { include: { feature: true }, orderBy: { order: 'asc' } },
  whatToTake: {
    include: { item: { include: { category: true } } },
    orderBy: { order: 'asc' },
  },
  relatedTours: {
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      badges: true,
      durationDays: true,
    },
  },
} satisfies Prisma.TourInclude;

/** Облегчённый набор полей для карточек в списках/каталоге. */
const TOUR_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  badges: true,
  durationDays: true,
  groupSize: true,
  difficulty: true,
  season: true,
  nearestDate: true,
  isPublished: true,
  category: { select: { id: true, name: true, slug: true } },
  priceOptions: {
    select: { priceFrom: true },
    orderBy: { priceFrom: 'asc' },
    take: 1,
  },
} satisfies Prisma.TourSelect;

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────────────────── Публичные методы ─────────────────────────

  async findPublished(query: QueryToursDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.TourWhereInput = {
      isPublished: true,
      ...this.buildFilters(query),
    };

    return this.paginate(where, query);
  }

  async findBySlug(slug: string) {
    const tour = await this.prisma.tour.findFirst({
      where: { slug, isPublished: true },
      include: TOUR_DETAIL_INCLUDE,
    });
    if (!tour) throw new NotFoundException(`Тур «${slug}» не найден`);
    return tour;
  }

  // ────────────────────────── Админские методы ────────────────────────

  async findAllForAdmin(query: QueryToursDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.TourWhereInput = {
      ...this.buildFilters(query),
      ...(query.isPublished !== undefined
        ? { isPublished: query.isPublished === 'true' }
        : {}),
    };

    return this.paginate(where, query);
  }

  async findOneForAdmin(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: TOUR_DETAIL_INCLUDE,
    });
    if (!tour) throw new NotFoundException(`Тур с ID ${id} не найден`);
    return tour;
  }

  async create(dto: CreateTourDto) {
    const slug = await ensureUniqueSlug(dto.slug || dto.title, (s) =>
      this.slugExists(s),
    );

    return this.prisma.tour.create({
      data: {
        ...this.buildScalarData(dto),
        slug,
        title: dto.title,
        durationDays: dto.durationDays,
        difficulty: dto.difficulty,
        ...this.buildNestedWrites(dto),
        relatedTours: dto.relatedTourIds?.length
          ? { connect: dto.relatedTourIds.map((id) => ({ id })) }
          : undefined,
      },
      include: TOUR_DETAIL_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTourDto) {
    await this.findOneForAdmin(id);

    const slug =
      dto.slug !== undefined
        ? await ensureUniqueSlug(dto.slug || dto.title || id, (s) =>
            this.slugExists(s, id),
          )
        : undefined;

    // Вложенные коллекции и привязки пересоздаём целиком (удалить → создать заново).
    return this.prisma.$transaction(async (tx) => {
      await this.clearReplacedRelations(tx, id, dto);

      return tx.tour.update({
        where: { id },
        data: {
          ...this.buildScalarData(dto),
          ...(slug ? { slug } : {}),
          ...this.buildNestedWrites(dto),
          ...(dto.relatedTourIds !== undefined
            ? {
                relatedTours: {
                  set: dto.relatedTourIds.map((relId) => ({ id: relId })),
                },
              }
            : {}),
        },
        include: TOUR_DETAIL_INCLUDE,
      });
    });
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);
    await this.prisma.tour.delete({ where: { id } });
    return { success: true };
  }

  // ──────────────────────────── Хелперы ───────────────────────────────

  private async paginate(
    where: Prisma.TourWhereInput,
    query: QueryToursDto,
  ): Promise<PaginatedResult<unknown>> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tour.findMany({
        where,
        select: TOUR_CARD_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.tour.count({ where }),
    ]);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  /** Общие фильтры каталога (категория, поиск, сложность, цена). */
  private buildFilters(query: QueryToursDto): Prisma.TourWhereInput {
    const priceFilter: Prisma.IntFilter = {};
    if (query.priceMin !== undefined) priceFilter.gte = query.priceMin;
    if (query.priceMax !== undefined) priceFilter.lte = query.priceMax;

    return {
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(Object.keys(priceFilter).length
        ? { priceOptions: { some: { priceFrom: priceFilter } } }
        : {}),
    };
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const found = await this.prisma.tour.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!found && found.id !== exceptId;
  }

  /** Скалярные поля тура (без вложенных связей). */
  private buildScalarData(dto: CreateTourDto | UpdateTourDto) {
    return {
      title: dto.title,
      subtitle: dto.subtitle,
      description: dto.description,
      coverImage: dto.coverImage,
      gallery: dto.gallery,
      durationDays: dto.durationDays,
      groupSize: dto.groupSize,
      difficulty: dto.difficulty,
      season: dto.season,
      nearestDate: dto.nearestDate ? new Date(dto.nearestDate) : undefined,
      badges: dto.badges,
      aboutText: dto.aboutText,
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
      isPublished: dto.isPublished,
    };
  }

  /** Вложенные create-блоки для тех коллекций, что переданы в DTO. */
  private buildNestedWrites(dto: CreateTourDto | UpdateTourDto) {
    return {
      ...(dto.program !== undefined
        ? {
            program: {
              create: dto.program.map((item) => ({
                order: item.order,
                title: item.title,
                description: item.description,
                tags: item.tagIds?.length
                  ? { connect: item.tagIds.map((id) => ({ id })) }
                  : undefined,
              })),
            },
          }
        : {}),
      ...(dto.priceOptions !== undefined
        ? {
            priceOptions: {
              create: dto.priceOptions.map((option) => ({
                formatName: option.formatName,
                priceFrom: option.priceFrom,
                maxGroupSize: option.maxGroupSize,
              })),
            },
          }
        : {}),
      ...(dto.sessions !== undefined
        ? {
            sessions: {
              create: dto.sessions.map((session) => ({
                dateFrom: new Date(session.dateFrom),
                dateTo: new Date(session.dateTo),
                availability: session.availability,
              })),
            },
          }
        : {}),
      ...(dto.importantInfo !== undefined
        ? {
            importantInfo: {
              create: dto.importantInfo.map((info, index) => ({
                icon: info.icon,
                title: info.title,
                description: info.description,
                type: info.type,
                order: index,
              })),
            },
          }
        : {}),
      ...(dto.features !== undefined
        ? {
            features: {
              create: dto.features.map((link, index) => ({
                feature: { connect: { id: link.featureId } },
                inclusion: link.inclusion,
                note: link.note,
                order: index,
              })),
            },
          }
        : {}),
      ...(dto.whatToTakeItemIds !== undefined
        ? {
            whatToTake: {
              create: dto.whatToTakeItemIds.map((itemId, index) => ({
                item: { connect: { id: itemId } },
                order: index,
              })),
            },
          }
        : {}),
    };
  }

  /** Удаляет коллекции, которые будут пересозданы при обновлении. */
  private async clearReplacedRelations(
    tx: Prisma.TransactionClient,
    tourId: string,
    dto: UpdateTourDto,
  ) {
    if (dto.program !== undefined) {
      await tx.tourProgramItem.deleteMany({ where: { tourId } });
    }
    if (dto.priceOptions !== undefined) {
      await tx.tourPriceOption.deleteMany({ where: { tourId } });
    }
    if (dto.sessions !== undefined) {
      await tx.tourSession.deleteMany({ where: { tourId } });
    }
    if (dto.importantInfo !== undefined) {
      await tx.importantInfoItem.deleteMany({ where: { tourId } });
    }
    if (dto.features !== undefined) {
      await tx.tourFeatureLink.deleteMany({ where: { tourId } });
    }
    if (dto.whatToTakeItemIds !== undefined) {
      await tx.tourWhatToTakeLink.deleteMany({ where: { tourId } });
    }
  }
}
