import slugify from 'slugify';

/**
 * Генерирует URL-слаг из строки (с транслитерацией кириллицы).
 * Например: «Толбачик, по следам извержений» → «tolbachik-po-sledam-izverzheniy».
 */
export function generateSlug(source: string): string {
  return slugify(source, {
    lower: true,
    strict: true, // убирает спецсимволы
    locale: 'ru', // транслитерация кириллицы
    trim: true,
  });
}

/**
 * Делает слаг уникальным: если базовый слаг занят, добавляет суффикс -2, -3 и т.д.
 * `exists` — функция проверки занятости слага в БД.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateSlug(base) || 'item';
  let candidate = baseSlug;
  let counter = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}
