import sharp from 'sharp';

/**
 * Уменьшенные копии фото для сайта: 480 — карточки и миниатюры, 1280 — большое
 * фото галереи и обложка. Оригинал не трогаем — его открывает просмотр фото.
 * Имена предсказуемые (abc.jpg → abc-w480.webp), фронт строит их сам.
 */
export const IMAGE_VARIANT_WIDTHS = [480, 1280] as const;

export interface ImageVariant {
  width: number;
  filename: string;
  buffer: Buffer;
}

export function variantFilename(filename: string, width: number): string {
  return `${filename.replace(/\.[^./]+$/, '')}-w${width}.webp`;
}

export async function buildImageVariants(
  filename: string,
  buffer: Buffer,
): Promise<ImageVariant[]> {
  return Promise.all(
    IMAGE_VARIANT_WIDTHS.map(async (width) => ({
      width,
      filename: variantFilename(filename, width),
      // rotate() без аргументов — поворот по EXIF, иначе фото с телефона ложатся набок.
      buffer: await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer(),
    })),
  );
}
