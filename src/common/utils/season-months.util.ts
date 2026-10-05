/**
 * Месяцы сезона тура из свободного текста — для фильтра «Когда» в каталоге.
 *
 * «Июнь-Сентябрь» → [6, 7, 8, 9]; «Декабрь-Апрель» → [12, 1, 2, 3, 4] (через
 * новый год); «Май-Июнь, Сентябрь» → [5, 6, 9]; «июн-сен» → [6, 7, 8, 9].
 * Непонятные слова пропускаются: «Недельная программа» → [].
 */
const MONTH_STEMS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'ма',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

function monthOf(word: string): number | null {
  const w = word.toLowerCase();
  // «ма» — и «май», и «мая»; «мар…» проверяется раньше.
  const index = MONTH_STEMS.findIndex((stem) => w.startsWith(stem));
  return index === -1 ? null : index + 1;
}

function range(from: number, to: number): number[] {
  const months: number[] = [];
  for (let m = from; ; m = (m % 12) + 1) {
    months.push(m);
    if (m === to || months.length === 12) return months;
  }
}

export function parseSeasonMonths(season?: string | null): number[] {
  if (!season) return [];
  const result = new Set<number>();
  for (const part of season.split(/[,;]|\sи\s/)) {
    const months = (part.match(/[А-Яа-яЁё]+/g) ?? [])
      .map(monthOf)
      .filter((m): m is number => m !== null);
    if (!months.length) continue;
    // «Июнь-Сентябрь» — диапазон; «Июнь Сентябрь» без тире — отдельные месяцы.
    if (months.length === 2 && /[-–—]/.test(part)) {
      range(months[0], months[1]).forEach((m) => result.add(m));
    } else {
      months.forEach((m) => result.add(m));
    }
  }
  return [...result].sort((a, b) => a - b);
}
