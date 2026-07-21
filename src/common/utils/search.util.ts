/**
 * Разбор поискового запроса: нормализация, раскладка, токены.
 *
 * Поиск строится на `contains` без полнотекстовых индексов и расширений
 * Postgres — так эндпоинт не требует миграций и работает на любой БД проекта.
 */

/** Латинская раскладка → кириллица (частая ошибка: «rfvxfnrf» вместо «камчатка»). */
const QWERTY_TO_RU: Record<string, string> = {
  q: 'й',
  w: 'ц',
  e: 'у',
  r: 'к',
  t: 'е',
  y: 'н',
  u: 'г',
  i: 'ш',
  o: 'щ',
  p: 'з',
  '[': 'х',
  ']': 'ъ',
  a: 'ф',
  s: 'ы',
  d: 'в',
  f: 'а',
  g: 'п',
  h: 'р',
  j: 'о',
  k: 'л',
  l: 'д',
  ';': 'ж',
  "'": 'э',
  z: 'я',
  x: 'ч',
  c: 'с',
  v: 'м',
  b: 'и',
  n: 'т',
  m: 'ь',
  ',': 'б',
  '.': 'ю',
};

/** Слова, которые сами по себе ничего не сужают. */
const STOP_WORDS = new Set([
  'тур',
  'туры',
  'на',
  'по',
  'в',
  'во',
  'из',
  'для',
  'с',
  'и',
  'до',
  'от',
]);

const MIN_TOKEN_LENGTH = 2;

export interface ParsedSearchQuery {
  /** Исходная строка после trim. */
  raw: string;
  /** Нормализованный запрос целиком — для бонуса за точное совпадение. */
  phrase: string;
  /** Основы слов, по которым идёт поиск. */
  tokens: string[];
  /** Запрос набирали в латинской раскладке и мы его перевели. */
  layoutFixed: boolean;
}

/**
 * Отбрасывает частые русские окончания, чтобы «камчатка» находила «по Камчатке»,
 * а «вулканы» — «вулкана». Полноценный стеммер тут избыточен: поиск идёт по
 * `contains`, поэтому достаточно урезать слово до основы.
 */
const ENDINGS = [
  'ами',
  'ями',
  'ого',
  'его',
  'ому',
  'ему',
  'ыми',
  'ими',
  'ах',
  'ях',
  'ов',
  'ев',
  'ой',
  'ый',
  'ий',
  'ая',
  'яя',
  'ое',
  'ее',
  'ые',
  'ие',
  'ом',
  'ем',
  'ем',
  'ии',
  'ью',
  'ья',
  'ам',
  'ям',
  'а',
  'я',
  'ы',
  'и',
  'у',
  'ю',
  'е',
  'о',
  'й',
  'ь',
];
const MIN_STEM_LENGTH = 4;

export function stemToken(token: string): string {
  if (token.length <= MIN_STEM_LENGTH) return token;
  for (const ending of ENDINGS) {
    if (
      token.endsWith(ending) &&
      token.length - ending.length >= MIN_STEM_LENGTH
    ) {
      return token.slice(0, -ending.length);
    }
  }
  return token;
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/ё/g, 'е').trim();

/** Переводит строку из латинской раскладки в кириллицу. */
export function fixKeyboardLayout(value: string): string {
  return value
    .split('')
    .map((ch) => QWERTY_TO_RU[ch] ?? ch)
    .join('');
}

/**
 * Разбирает пользовательский ввод в набор токенов.
 * Если в запросе только латиница — считаем это ошибкой раскладки и переводим.
 */
export function parseSearchQuery(input: string): ParsedSearchQuery {
  const raw = input.trim().slice(0, 100);
  const hasCyrillic = /[а-яё]/i.test(raw);
  const hasLatinLetters = /[a-z]/i.test(raw);
  const layoutFixed = hasLatinLetters && !hasCyrillic;

  const normalized = normalize(layoutFixed ? fixKeyboardLayout(raw) : raw);

  const all = normalized
    .split(/[\s,.;/\\]+/)
    .map((t) => t.replace(/[^0-9a-zа-я-]/gi, ''))
    .filter((t) => t.length >= MIN_TOKEN_LENGTH);

  // Стоп-слова выкидываем, но только если после них что-то останется.
  const meaningful = all.filter((t) => !STOP_WORDS.has(t));
  const tokens = [
    ...new Set((meaningful.length ? meaningful : all).map(stemToken)),
  ].slice(0, 6);

  return { raw, phrase: normalized, tokens, layoutFixed };
}

/**
 * Варианты написания токена для `contains`: «е» и «ё» в БД не эквивалентны
 * («вертолет» не найдёт «вертолётный»), поэтому перебираем оба написания в
 * каждой позиции. Больше трёх «е» в слове — перебор не окупается.
 */
const MAX_YO_POSITIONS = 3;

export function tokenVariants(token: string): string[] {
  const positions = [...token].reduce<number[]>(
    (acc, ch, i) => (ch === 'е' ? [...acc, i] : acc),
    [],
  );
  if (!positions.length || positions.length > MAX_YO_POSITIONS) return [token];

  let variants = [token];
  for (const pos of positions) {
    variants = variants.flatMap((v) => [
      v,
      `${v.slice(0, pos)}ё${v.slice(pos + 1)}`,
    ]);
  }
  return [...new Set(variants)];
}

/** Нормализованное поле для сравнения со скорингом. */
export const normalizeForScore = (value?: string | null): string =>
  value ? normalize(value) : '';
