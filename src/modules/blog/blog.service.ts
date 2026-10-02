import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginatedResult,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { ensureUniqueSlug, generateSlug } from '../../common/utils/slug.util';
import { Prisma } from '../../generated/prisma/client';
import { ToursService } from '../tours/tours.service';
import {
  blocksPlainText,
  collectTourIds,
  readBlocks,
  sanitizeBlocks,
} from './blog-blocks';
import {
  BlogListQueryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/blog.dto';

const CATEGORY_SELECT = { slug: true, name: true };

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  content: true,
  blocks: true,
  publishedAt: true,
  isPublished: true,
  category: { select: CATEGORY_SELECT },
};

/** Средний темп чтения на русском — ~180 слов в минуту. */
const WORDS_PER_MINUTE = 180;

/** Примерное время чтения в минутах по объёму текста (без HTML), минимум 1. */
function readingMinutes(text: string): number {
  const plain = text.replace(/<[^>]+>/g, ' ');
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * Добавляет вычисляемое поле readingMinutes — по блокам, а у старых статей без
 * блоков по content.
 */
function withReadingTime<
  T extends { content?: string | null; blocks?: Prisma.JsonValue },
>(post: T) {
  const blocks = readBlocks(post.blocks);
  const text = blocks.length ? blocksPlainText(blocks) : (post.content ?? '');
  return { ...post, readingMinutes: readingMinutes(text) };
}

/** В списках блоки не нужны — по ним только посчитано время чтения. */
function toListItem<
  T extends { content?: string | null; blocks?: Prisma.JsonValue },
>(post: T) {
  return { ...withReadingTime(post), blocks: undefined };
}

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tours: ToursService,
  ) {}

  async findPublished(query: BlogListQueryDto) {
    const where = {
      isPublished: true,
      ...(query.category ? { category: { slug: query.category } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { publishedAt: query.sort === 'old' ? 'asc' : 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return buildPaginatedResult(
      items.map(toListItem),
      total,
      query.page,
      query.limit,
    );
  }

  /** Категории с количеством опубликованных статей (для плашек-фильтров). */
  async findCategories() {
    const categories = await this.prisma.blogCategory.findMany({
      select: {
        slug: true,
        name: true,
        _count: {
          select: { posts: { where: { isPublished: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories
      .map((c) => ({ slug: c.slug, name: c.name, count: c._count.posts }))
      .filter((c) => c.count > 0);
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
      include: { category: { select: CATEGORY_SELECT } },
    });
    if (!post) throw new NotFoundException(`Статья «${slug}» не найдена`);
    // Карточки для блоков «Туры»: снятые с публикации туры просто не покажутся.
    const tours = await this.tours.findCardsByIds(
      collectTourIds(readBlocks(post.blocks)),
      { publishedOnly: true },
    );
    return { ...withReadingTime(post), tours };
  }

  async findAllForAdmin(query: PaginationDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        select: LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.blogPost.count(),
    ]);
    return buildPaginatedResult(
      items.map(toListItem),
      total,
      query.page,
      query.limit,
    );
  }

  async findOneForAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { category: { select: CATEGORY_SELECT } },
    });
    if (!post) throw new NotFoundException(`Статья с ID ${id} не найдена`);
    return withReadingTime(post);
  }

  async create(dto: CreateBlogPostDto) {
    const slug = await ensureUniqueSlug(dto.slug || dto.title, (s) =>
      this.slugExists(s),
    );
    const categoryId = await this.resolveCategoryId(dto.categoryName);
    return this.prisma.blogPost.create({
      data: {
        slug,
        title: dto.title,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        coverCaption: dto.coverCaption,
        lead: dto.lead,
        content: dto.content,
        blocks: dto.blocks ? sanitizeBlocks(dto.blocks) : undefined,
        categoryId: categoryId ?? undefined,
        isPublished: dto.isPublished ?? false,
        publishedAt: this.resolvePublishedAt(dto, null),
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.findOneForAdmin(id);

    const slug =
      dto.slug !== undefined
        ? await ensureUniqueSlug(dto.slug || dto.title || id, (s) =>
            this.slugExists(s, id),
          )
        : undefined;

    // categoryName не передан — не трогаем; передан пустой — открепляем.
    const categoryId =
      dto.categoryName === undefined
        ? undefined
        : await this.resolveCategoryId(dto.categoryName);

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(slug ? { slug } : {}),
        title: dto.title,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        coverCaption: dto.coverCaption,
        lead: dto.lead,
        content: dto.content,
        blocks: dto.blocks ? sanitizeBlocks(dto.blocks) : undefined,
        ...(categoryId === undefined ? {} : { categoryId }),
        isPublished: dto.isPublished,
        publishedAt: this.resolvePublishedAt(dto, existing.publishedAt),
      },
    });
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }

  /**
   * По названию категории возвращает её id, создавая категорию при отсутствии.
   * Пустая строка → null (открепить/без категории); `undefined` → undefined (не трогать).
   */
  private async resolveCategoryId(
    name?: string,
  ): Promise<string | null | undefined> {
    if (name === undefined) return undefined;
    const trimmed = name.trim();
    if (!trimmed) return null;

    const existing = await this.prisma.blogCategory.findFirst({
      where: { name: { equals: trimmed, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) return existing.id;

    const slug = await ensureUniqueSlug(trimmed, (s) =>
      this.categorySlugExists(s),
    );
    const created = await this.prisma.blogCategory.create({
      data: { name: trimmed, slug: slug || generateSlug(trimmed) },
      select: { id: true },
    });
    return created.id;
  }

  /**
   * Дата публикации: явная из DTO имеет приоритет; иначе при первой публикации
   * проставляется текущая дата, при снятии с публикации сбрасывается в null.
   */
  private resolvePublishedAt(
    dto: CreateBlogPostDto | UpdateBlogPostDto,
    current: Date | null,
  ): Date | null | undefined {
    if (dto.publishedAt) return new Date(dto.publishedAt);
    if (dto.isPublished === true) return current ?? new Date();
    if (dto.isPublished === false) return null;
    return undefined; // не трогаем
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const found = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!found && found.id !== exceptId;
  }

  private async categorySlugExists(slug: string): Promise<boolean> {
    const found = await this.prisma.blogCategory.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!found;
  }
}
