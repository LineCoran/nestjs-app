import { BadRequestException } from '@nestjs/common';

/**
 * Тело статьи блога — массив блоков. Фронт (админка и сайт) знает те же типы:
 * `src/entities/blog/model/blocks.ts`. Здесь блоки приводятся к известной форме:
 * лишние поля отбрасываются, строки обрезаются, неизвестный тип — 400.
 */
export const BLOG_BLOCK_TYPES = [
  'text',
  'heading',
  'image',
  'images',
  'gallery',
  'quote',
  'callout',
  'button',
  'tours',
] as const;

export type BlogBlockType = (typeof BLOG_BLOCK_TYPES)[number];

/** Цвет плашки — те же варианты, что у алертов «Важно знать» на странице тура. */
export const CALLOUT_VARIANTS = [
  'default',
  'success',
  'info',
  'danger',
] as const;
type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export type BlogBlock =
  | { id: string; type: 'text'; html: string }
  | { id: string; type: 'heading'; text: string; level: 2 | 3 }
  | { id: string; type: 'image'; url: string; caption: string }
  | { id: string; type: 'images'; urls: string[]; caption: string }
  | { id: string; type: 'gallery'; urls: string[]; caption: string }
  | { id: string; type: 'quote'; label: string; text: string }
  | {
      id: string;
      type: 'callout';
      variant: CalloutVariant;
      icon: string;
      title: string;
      html: string;
    }
  | { id: string; type: 'button'; label: string; href: string }
  | { id: string; type: 'tours'; tourIds: string[] };

const MAX_BLOCKS = 200;
/** «Фото в ряд» — 2 или 3 кадра, больше в колонку статьи не помещается. */
const MAX_ROW_IMAGES = 3;
const MAX_GALLERY_IMAGES = 60;
const MAX_TOURS = 12;

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const strList = (value: unknown, max: number) =>
  (Array.isArray(value) ? value : []).map(str).filter(Boolean).slice(0, max);

let seq = 0;
const newId = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

function sanitizeBlock(raw: unknown, index: number): BlogBlock {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException(`blocks[${index}]: ожидается объект`);
  }
  const b = raw as Record<string, unknown>;
  const id = str(b.id).slice(0, 64) || newId();
  const type = b.type as BlogBlockType;

  switch (type) {
    case 'text':
      return { id, type, html: str(b.html) };
    case 'heading':
      return { id, type, text: str(b.text), level: b.level === 3 ? 3 : 2 };
    case 'image':
      return { id, type, url: str(b.url), caption: str(b.caption) };
    case 'images':
      return {
        id,
        type,
        urls: strList(b.urls, MAX_ROW_IMAGES),
        caption: str(b.caption),
      };
    case 'gallery':
      return {
        id,
        type,
        urls: strList(b.urls, MAX_GALLERY_IMAGES),
        caption: str(b.caption),
      };
    case 'quote':
      return { id, type, label: str(b.label), text: str(b.text) };
    case 'callout': {
      const variant = (CALLOUT_VARIANTS as readonly string[]).includes(
        str(b.variant),
      )
        ? (str(b.variant) as CalloutVariant)
        : 'default';
      return {
        id,
        type,
        variant,
        icon: str(b.icon),
        title: str(b.title),
        html: str(b.html),
      };
    }
    case 'button':
      return { id, type, label: str(b.label), href: str(b.href) };
    case 'tours':
      return { id, type, tourIds: [...new Set(strList(b.tourIds, MAX_TOURS))] };
    default:
      throw new BadRequestException(
        `blocks[${index}]: неизвестный тип блока «${String(b.type)}»`,
      );
  }
}

export function sanitizeBlocks(raw: unknown): BlogBlock[] {
  if (!Array.isArray(raw)) {
    throw new BadRequestException('blocks: ожидается массив');
  }
  if (raw.length > MAX_BLOCKS) {
    throw new BadRequestException(`blocks: не больше ${MAX_BLOCKS} блоков`);
  }
  return raw.map(sanitizeBlock);
}

/** Блоки из БД (Json) — как массив; мусор не роняет страницу. */
export function readBlocks(value: unknown): BlogBlock[] {
  return Array.isArray(value) ? (value as BlogBlock[]) : [];
}

/** Id туров из блоков «Туры» — по ним сервис подтягивает карточки. */
export function collectTourIds(blocks: BlogBlock[]): string[] {
  const ids = blocks.flatMap((b) => (b.type === 'tours' ? b.tourIds : []));
  return [...new Set(ids)];
}

/** Весь читаемый текст статьи (для времени чтения). */
export function blocksPlainText(blocks: BlogBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'text':
          return b.html;
        case 'heading':
          return b.text;
        case 'quote':
          return b.text;
        case 'callout':
          return `${b.title} ${b.html}`;
        case 'image':
        case 'images':
        case 'gallery':
          return b.caption;
        default:
          return '';
      }
    })
    .join(' ');
}

/**
 * Боковая панель справа от статьи. Содержание собирается на фронте из
 * подзаголовков; здесь — что показывать и чем заполнить остальное.
 * Тексты автора пустые — берутся имя и описание гида.
 */
// type, а не interface: Prisma принимает в Json только типы с неявной индексной сигнатурой.
export type BlogSidebar = {
  showToc: boolean;
  authorLabel: string;
  authorText: string;
  toursTitle: string;
  tourIds: string[];
  buttonLabel: string;
  buttonHref: string;
};

const MAX_SIDEBAR_TOURS = 6;

export function sanitizeSidebar(raw: unknown): BlogSidebar {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new BadRequestException('sidebar: ожидается объект');
  }
  const s = raw as Record<string, unknown>;
  return {
    showToc: s.showToc !== false,
    authorLabel: str(s.authorLabel),
    authorText: str(s.authorText),
    toursTitle: str(s.toursTitle),
    tourIds: [...new Set(strList(s.tourIds, MAX_SIDEBAR_TOURS))],
    buttonLabel: str(s.buttonLabel),
    buttonHref: str(s.buttonHref),
  };
}

/** Панель из БД (Json); старые статьи — пустой объект. */
export function readSidebarTourIds(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const ids = (value as { tourIds?: unknown }).tourIds;
  return Array.isArray(ids)
    ? ids.filter((id): id is string => typeof id === 'string')
    : [];
}
