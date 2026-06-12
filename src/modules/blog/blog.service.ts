import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginatedResult,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { ensureUniqueSlug } from '../../common/utils/slug.util';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  isPublished: true,
};

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query: PaginationDto) {
    const where = { isPublished: true };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { publishedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
    });
    if (!post) throw new NotFoundException(`Статья «${slug}» не найдена`);
    return post;
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
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async findOneForAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Статья с ID ${id} не найдена`);
    return post;
  }

  async create(dto: CreateBlogPostDto) {
    const slug = await ensureUniqueSlug(dto.slug || dto.title, (s) =>
      this.slugExists(s),
    );
    return this.prisma.blogPost.create({
      data: {
        slug,
        title: dto.title,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        content: dto.content,
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

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(slug ? { slug } : {}),
        title: dto.title,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        content: dto.content,
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
}
