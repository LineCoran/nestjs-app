import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsObject,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateBlogPostDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  /** Вводный абзац под заголовком статьи. */
  @IsOptional()
  @IsString()
  lead?: string;

  /** Подпись под обложкой в статье. */
  @IsOptional()
  @IsString()
  coverCaption?: string;

  /** Устаревший HTML-текст; новые статьи пишутся блоками. */
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * Тело статьи — блоки { id, type, ... }. Форму каждого блока проверяет
   * `sanitizeBlocks` (blog-blocks.ts): у блоков разные поля, декораторами их не описать.
   */
  @IsOptional()
  @IsArray()
  blocks?: unknown[];

  /** Боковая панель: содержание, тексты автора, туры, кнопка (форму проверяет `sanitizeSidebar`). */
  @IsOptional()
  @IsObject()
  sidebar?: Record<string, unknown>;

  /** Гид-автор статьи; пустая строка — без автора. */
  @IsOptional()
  @IsString()
  authorId?: string;

  /** Название категории/типа статьи. Категория создаётся, если её ещё нет; пустая строка — открепить. */
  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}

export type BlogSort = 'new' | 'old';

/** Query-параметры публичного списка статей: пагинация + фильтр по категории + сортировка. */
export class BlogListQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['new', 'old'])
  sort?: BlogSort;
}
