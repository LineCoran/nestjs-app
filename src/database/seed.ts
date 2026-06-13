/**
 * Демо-сид: наполняет БД большим объёмом реалистичных данных для тестирования.
 * Идемпотентен: справочники upsert-ятся, а контент (туры, гиды, блог, заявки)
 * пересоздаётся заново при каждом запуске.
 *
 * Запуск: npm run seed:demo
 */
import 'dotenv/config';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const img = (seed: string, w = 1200, h = 760) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const pick = <T>(arr: T[], n: number): T[] =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const TRANSLIT: Record<string, string> = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };

const usedSlugs = new Set<string>();
function makeSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .split('')
      .map((ch) => TRANSLIT[ch] ?? ch)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'tour';
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
  usedSlugs.add(slug);
  return slug;
}

/** Сессии-заезды внутри указанного месяца сезона (2026). */
function makeSessions(startMonth: number, durationDays: number, count: number) {
  const availability = ['AVAILABLE', 'LIMITED', 'FULL', 'AVAILABLE'] as const;
  const sessions: { dateFrom: Date; dateTo: Date; availability: any }[] = [];
  let day = rand(1, 6);
  let month = startMonth;
  for (let i = 0; i < count; i++) {
    const dateFrom = new Date(Date.UTC(2026, month - 1, day));
    const dateTo = new Date(Date.UTC(2026, month - 1, day + durationDays));
    sessions.push({ dateFrom, dateTo, availability: availability[i % 4] });
    day += durationDays + rand(8, 16);
    if (day > 25) {
      day -= 24;
      month += 1;
    }
  }
  return sessions;
}

async function main() {
  console.log('🌱 Демо-сид: старт');

  // ── Администратор ──
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin12345',
    10,
  );
  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@gory.local' },
    update: { passwordHash },
    create: { email: process.env.ADMIN_EMAIL || 'admin@gory.local', passwordHash },
  });

  // ── Категории ──
  const categoryData = [
    { name: 'Вулканы', slug: 'vulkany' },
    { name: 'Хели-ски', slug: 'heli-ski' },
    { name: 'Лето', slug: 'leto' },
    { name: 'Сплав', slug: 'splav' },
    { name: 'Зимние туры', slug: 'zimnie' },
    { name: 'Морские прогулки', slug: 'morskie' },
    { name: 'Фрирайд', slug: 'frirayd' },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.tourCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categories[c.slug] = cat.id;
  }
  console.log(`✅ Категорий: ${categoryData.length}`);

  // ── Справочник «что входит / не входит» ──
  const featureData = [
    { name: 'Трансфер от места размещения', category: 'Транспорт' },
    { name: '3-разовое питание', category: 'Питание' },
    { name: 'Проживание в палатках / глэмпинге', category: 'Проживание' },
    { name: 'Сопровождение гида', category: 'Услуги' },
    { name: 'Прокат снаряжения', category: 'Снаряжение' },
    { name: 'Разрешение в природный парк', category: 'Услуги' },
    { name: 'Баня после маршрута', category: 'Услуги' },
    { name: 'Регистрация в МЧС', category: 'Услуги' },
    { name: 'Вертолётная заброска', category: 'Транспорт' },
    { name: 'Авиаперелёт до Петропавловска-Камчатского', category: 'Транспорт' },
    { name: 'Трекинговые ботинки', category: 'Снаряжение' },
    { name: 'Аренда снаряжения', category: 'Снаряжение' },
    { name: 'Дополнительные экскурсии', category: 'Услуги' },
    { name: 'Медицинская страховка', category: 'Услуги' },
    { name: 'Личный фотограф', category: 'Услуги' },
  ];
  const features: Record<string, string> = {};
  for (const f of featureData) {
    const feat = await prisma.tourFeature.upsert({
      where: { name: f.name },
      update: { category: f.category },
      create: f,
    });
    features[f.name] = feat.id;
  }
  console.log(`✅ Фич: ${featureData.length}`);

  // ── Теги программы ──
  const tagNames = [
    'Акклиматизация', 'Завтрак', 'Обед', 'Ужин', 'Трансфер', 'Восхождение',
    'Экскурсия', 'Баня', 'Свободное время', 'Перелёт', 'Сплав', 'Ночёвка в палатке',
    'Купание в источниках', 'Фотосессия',
  ];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.programTag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags[name] = tag.id;
  }
  console.log(`✅ Тегов: ${tagNames.length}`);

  // ── Справочник «что взять с собой» ──
  const whatToTakeData: Record<string, string[]> = {
    'Личные вещи': ['Паспорт', 'Личная аптечка', 'Солнцезащитный крем', 'Солнцезащитные очки', 'Термос', 'Гигиенические принадлежности'],
    Одежда: ['Мембранная куртка', 'Тёплая флиска', 'Термобельё', 'Шапка и перчатки', 'Сменные носки', 'Дождевик'],
    Снаряжение: ['Треккинговые ботинки', 'Треккинговые палки', 'Спальник', 'Рюкзак 30–40 л', 'Налобный фонарь', 'Каремат'],
    Документы: ['Полис ОМС', 'Договор страхования', 'Наличные деньги'],
  };
  const wttItems: Record<string, string> = {};
  for (const [catName, items] of Object.entries(whatToTakeData)) {
    const cat = await prisma.whatToTakeCategory.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
    for (const itemName of items) {
      const item = await prisma.whatToTakeItem.upsert({
        where: { categoryId_name: { categoryId: cat.id, name: itemName } },
        update: {},
        create: { name: itemName, categoryId: cat.id },
      });
      wttItems[itemName] = item.id;
    }
  }
  console.log('✅ Справочник «что взять» готов');

  // ── Контент компании ──
  const existingCompany = await prisma.companyInfo.findFirst();
  const companyPayload = {
    heroTitle: 'Камчатка, которая меняет тебя',
    heroSubtitle:
      'Восхождения на вулканы, медведи в дикой природе, горячие источники и настоящие приключения с опытными гидами.',
    heroImage: img('kamchatka-hero', 1920, 1080),
    aboutText:
      '<p>Мы — местная команда гидов на Камчатке. Организуем атмосферные маршруты с 2020 года.</p><p>Безопасность каждой группы, забота о природе и любовь к этому краю — наши главные принципы. Более 2500 туристов уже увидели Камчатку вместе с нами.</p>',
    aboutImage: img('kamchatka-about', 1000, 750),
    contactPhone: '+7 (924) 123-45-67',
    telegramLink: 'https://t.me/gorypokoleno',
    vkLink: 'https://vk.com/gorypokoleno',
    stats: [
      { value: '6+', label: 'лет опыта' },
      { value: '2,5+ тыс.', label: 'туристов' },
      { value: '4.9', label: 'рейтинг' },
      { value: 'МЧС', label: 'сертификаты' },
      { value: 'РТО', label: 'лицензия' },
    ],
  };
  if (existingCompany) {
    await prisma.companyInfo.update({ where: { id: existingCompany.id }, data: companyPayload });
  } else {
    await prisma.companyInfo.create({ data: companyPayload });
  }
  console.log('✅ Контент компании обновлён');

  // ── Очистка контента перед пересозданием ──
  await prisma.booking.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.blogPost.deleteMany();

  // ── Гиды ──
  const guideData = [
    { name: 'Андрей Лавров', role: 'Старший инструктор, проводник', description: 'Снежный барс, 12 лет водит группы на вулканы Камчатки. Спокоен в любой ситуации.', seed: 'guide-andrey' },
    { name: 'Дмитрий Серов', role: 'Инструктор, водитель', description: 'Знает каждую тропу полуострова и умеет пройти там, где другие застревают.', seed: 'guide-dmitry' },
    { name: 'Алексей Гордеев', role: 'Гид-фотограф', description: 'Поможет сделать кадры, которыми вы будете гордиться всю жизнь.', seed: 'guide-alex' },
    { name: 'Мария Котова', role: 'Гид, медик группы', description: 'Дипломированный врач и опытный турист — здоровье группы под контролем.', seed: 'guide-maria' },
    { name: 'Сергей Белов', role: 'Инструктор по фрирайду', description: 'Мастер спорта по горным лыжам, эксперт по лавинной безопасности.', seed: 'guide-sergey' },
    { name: 'Ольга Минина', role: 'Гид-натуралист', description: 'Биолог, расскажет всё о флоре, фауне и медведях Камчатки.', seed: 'guide-olga' },
  ];
  await prisma.guide.createMany({
    data: guideData.map((g, i) => ({
      name: g.name,
      role: g.role,
      description: g.description,
      photo: img(g.seed, 500, 500),
      order: i,
    })),
  });
  console.log(`✅ Гидов: ${guideData.length}`);

  // ── Блог ──
  const blogData = [
    { title: 'Как подготовиться к восхождению на вулкан', excerpt: 'Снаряжение, физподготовка и что важно знать новичку перед первым восхождением.' },
    { title: 'Когда лучше ехать на Камчатку', excerpt: 'Разбираем сезоны: что доступно летом, а что — только зимой.' },
    { title: '5 вулканов, которые стоит увидеть', excerpt: 'От доступного Авачинского до сурового Толбачика — наш топ.' },
    { title: 'Медведи Камчатки: правила безопасности', excerpt: 'Как вести себя при встрече с косолапым и почему их не стоит бояться.' },
    { title: 'Долина гейзеров: что нужно знать', excerpt: 'Как добраться, что увидеть и почему это одно из чудес России.' },
    { title: 'Хели-ски на Камчатке для начинающих', excerpt: 'Реально ли покататься с вертолёта, если ты не профи? Разбираемся.' },
    { title: 'Что взять с собой в горный поход', excerpt: 'Полный чек-лист снаряжения от наших гидов.' },
    { title: 'Горячие источники Камчатки', excerpt: 'Лучшие термальные источники, где можно отдохнуть после маршрута.' },
    { title: 'Сплав по реке Быстрая: впечатления', excerpt: 'Рассказываем о самом популярном водном маршруте полуострова.' },
    { title: 'Камчатская кухня: что попробовать', excerpt: 'Краб, икра, папоротник и другие гастрономические открытия.' },
  ];
  for (let i = 0; i < blogData.length; i++) {
    const b = blogData[i];
    const slug = `post-${i + 1}`;
    await prisma.blogPost.create({
      data: {
        slug,
        title: b.title,
        excerpt: b.excerpt,
        coverImage: img(`blog-${i}`, 800, 1000),
        content: `<p>${b.excerpt}</p><p>Камчатка — удивительный край вулканов, гейзеров и нетронутой природы. В этой статье мы делимся опытом и практическими советами, которые пригодятся каждому, кто планирует путешествие.</p><h2>Главное</h2><p>Готовьтесь заранее, доверяйте гидам и наслаждайтесь моментом. Остальное мы берём на себя.</p>`,
        isPublished: i < 9, // одна статья — черновик
        publishedAt: i < 9 ? new Date(Date.UTC(2026, 2 + (i % 4), 5 + i)) : null,
      },
    });
  }
  console.log(`✅ Статей блога: ${blogData.length}`);

  // ── Туры ──
  const programTemplate = (place: string) => [
    { title: 'Сбор участников', description: 'Встреча в аэропорту Петропавловска-Камчатского, трансфер на базу, инструктаж и распределение снаряжения.', tagNames: ['Акклиматизация', 'Трансфер'] },
    { title: `Переход к ${place}`, description: 'Заброска к началу маршрута и первый день в пути. Акклиматизационная прогулка с набором высоты.', tagNames: ['Завтрак', 'Ужин', 'Ночёвка в палатке'] },
    { title: 'Основной маршрут', description: 'Ключевой день программы: восхождение, экскурсия и знакомство с главными достопримечательностями района.', tagNames: ['Восхождение', 'Обед', 'Фотосессия'] },
    { title: 'Горячие источники и баня', description: 'День отдыха: купание в термальных источниках, баня и восстановление сил.', tagNames: ['Купание в источниках', 'Баня', 'Свободное время'] },
    { title: 'Возвращение', description: 'Сборы лагеря, трансфер в город. Прощальный ужин и обмен впечатлениями.', tagNames: ['Трансфер', 'Ужин'] },
  ];

  const importantTemplate = [
    { title: 'Погодные условия', description: 'При плохой погоде программа может быть скорректирована для безопасности группы.', type: 'INFO' },
    { title: 'Безопасность', description: 'Все восхождения проходят под контролем сертифицированного гида МЧС.', type: 'INFO' },
    { title: 'Скидка 10%', description: 'При бронировании за 3 месяца до старта действует ранняя скидка.', type: 'SUCCESS' },
    { title: 'Осталось мало мест', description: 'На ближайшие заезды количество мест ограничено.', type: 'WARNING' },
  ];

  const allIncluded = ['Трансфер от места размещения', '3-разовое питание', 'Проживание в палатках / глэмпинге', 'Сопровождение гида', 'Разрешение в природный парк', 'Регистрация в МЧС'];
  const allExcluded = ['Авиаперелёт до Петропавловска-Камчатского', 'Трекинговые ботинки', 'Аренда снаряжения', 'Медицинская страховка'];

  const tourDefs = [
    { title: 'Толбачик, по следам извержений', cat: 'vulkany', diff: 'MEDIUM', days: 7, season: 'июн-сен', month: 7, place: 'вулкану Толбачик', badges: ['хит'], prices: [['Вахтовый автобус', 65000], ['Джипы', 85000], ['Вертолёт', 145000]] },
    { title: 'Восхождение на Авачинский вулкан', cat: 'vulkany', diff: 'EASY', days: 3, season: 'июн-окт', month: 7, place: 'Авачинскому вулкану', badges: ['новинка'], prices: [['Стандарт', 32000], ['Комфорт', 48000]] },
    { title: 'Мутновский и Горелый за выходные', cat: 'vulkany', diff: 'MEDIUM', days: 4, season: 'июл-сен', month: 8, place: 'вулкану Мутновский', badges: [], prices: [['Группа', 41000], ['Джип-тур', 67000]] },
    { title: 'Долина гейзеров: вертолётный тур', cat: 'leto', diff: 'EASY', days: 1, season: 'июн-сен', month: 7, place: 'Долине гейзеров', badges: ['хит', 'вертолёт'], prices: [['Вертолёт', 52000]] },
    { title: 'Ключевская сопка: к высочайшему вулкану', cat: 'vulkany', diff: 'HARD', days: 10, season: 'июл-авг', month: 7, place: 'Ключевской сопке', badges: ['сложный'], prices: [['Экспедиция', 135000]] },
    { title: 'Хели-ски на Камчатке', cat: 'heli-ski', diff: 'HARD', days: 7, season: 'фев-апр', month: 3, place: 'склонам Авачинского', badges: ['премиум'], prices: [['Стандарт', 280000], ['VIP малая группа', 420000]] },
    { title: 'Фрирайд-тур «Дикие склоны»', cat: 'frirayd', diff: 'HARD', days: 6, season: 'фев-апр', month: 3, place: 'хребту', badges: [], prices: [['Группа', 195000]] },
    { title: 'Сплав по реке Быстрая', cat: 'splav', diff: 'EASY', days: 2, season: 'июн-сен', month: 8, place: 'реке Быстрая', badges: ['семейный'], prices: [['Рафт', 18000]] },
    { title: 'Морская прогулка к острову Старичков', cat: 'morskie', diff: 'EASY', days: 1, season: 'июн-сен', month: 7, place: 'Авачинской бухте', badges: ['киты'], prices: [['Катер', 14000], ['Яхта', 26000]] },
    { title: 'Большое путешествие по Камчатке', cat: 'leto', diff: 'MEDIUM', days: 12, season: 'июл-авг', month: 7, place: 'югу полуострова', badges: ['топ', 'всё включено'], prices: [['Стандарт', 168000], ['Комфорт', 235000]] },
    { title: 'Зимняя Камчатка: снегоходный тур', cat: 'zimnie', diff: 'MEDIUM', days: 5, season: 'янв-мар', month: 2, place: 'плато', badges: ['зима'], prices: [['Снегоход', 89000]] },
    { title: 'Медвежья рыбалка на Курильском озере', cat: 'leto', diff: 'EASY', days: 2, season: 'авг-сен', month: 8, place: 'Курильскому озеру', badges: ['медведи', 'хит'], prices: [['Вертолёт', 74000]] },
    { title: 'Тур выходного дня: Вачкажец', cat: 'leto', diff: 'EASY', days: 1, season: 'июн-окт', month: 8, place: 'массиву Вачкажец', badges: ['новинка'], prices: [['Группа', 9500]] },
    { title: 'Камчатка для фотографов', cat: 'leto', diff: 'MEDIUM', days: 8, season: 'авг-сен', month: 9, place: 'вулканическим плато', badges: ['авторский'], prices: [['Фототур', 142000]] },
  ] as const;

  const createdTourIds: string[] = [];
  for (const t of tourDefs) {
    const program = programTemplate(t.place).slice(0, Math.min(5, Math.max(2, Math.ceil(t.days / 2))));
    const included = pick(allIncluded, rand(4, 6));
    const excluded = pick(allExcluded, rand(2, 4));
    const wtt = pick(Object.keys(wttItems), rand(6, 12));
    const galleryCount = rand(4, 8);
    const slugBase = t.title.toLowerCase();

    const tour = await prisma.tour.create({
      data: {
        slug: makeSlug(t.title),
        title: t.title,
        subtitle: `${t.days}-дневная программа по Камчатке: ${t.place} и не только.`,
        description: `${t.place[0].toUpperCase()}${t.place.slice(1)}, горячие источники и атмосфера дикой природы.`,
        coverImage: img(`tour-cover-${slugBase}`, 900, 600),
        gallery: Array.from({ length: galleryCount }, (_, i) => img(`tour-${slugBase}-${i}`, 1200, 760)),
        durationDays: t.days,
        groupSize: `${rand(4, 8)}-${rand(9, 14)} чел.`,
        difficulty: t.diff as any,
        season: t.season,
        nearestDate: new Date(Date.UTC(2026, t.month - 1, rand(5, 20))),
        badges: [...t.badges],
        aboutText: `<p>Приглашаем в захватывающее путешествие по Камчатке! Вы посетите ${t.place}, прогуляетесь по уникальным природным местам и, возможно, встретите медведей в их естественной среде обитания.</p><p>Это незабываемое приключение оставит яркие впечатления на всю жизнь.</p>`,
        isPublished: true,
        category: { connect: { id: categories[t.cat] } },
        program: {
          create: program.map((p, idx) => ({
            order: idx + 1,
            title: p.title,
            description: p.description,
            tags: { connect: p.tagNames.map((n) => ({ id: tags[n] })) },
          })),
        },
        priceOptions: {
          create: t.prices.map(([formatName, priceFrom]) => ({
            formatName: formatName as string,
            priceFrom: priceFrom as number,
            maxGroupSize: rand(6, 14),
          })),
        },
        sessions: { create: makeSessions(t.month, t.days, rand(3, 5)) },
        importantInfo: {
          create: importantTemplate.map((info, idx) => ({ ...info, type: info.type as any, order: idx })),
        },
        features: {
          create: [
            ...included.map((name, idx) => ({ feature: { connect: { id: features[name] } }, inclusion: 'INCLUDED' as any, order: idx, note: idx === 0 ? 'по программе тура' : null })),
            ...excluded.map((name, idx) => ({ feature: { connect: { id: features[name] } }, inclusion: 'EXCLUDED' as any, order: idx })),
          ],
        },
        whatToTake: {
          create: wtt.map((name, idx) => ({ item: { connect: { id: wttItems[name] } }, order: idx })),
        },
      },
    });
    createdTourIds.push(tour.id);
  }

  // Связанные туры (по 3 случайных)
  for (const id of createdTourIds) {
    const others = pick(createdTourIds.filter((x) => x !== id), 3);
    await prisma.tour.update({
      where: { id },
      data: { relatedTours: { connect: others.map((x) => ({ id: x })) } },
    });
  }
  console.log(`✅ Туров: ${tourDefs.length}`);

  // ── Заявки ──
  const tourRows = await prisma.tour.findMany({
    select: { id: true, priceOptions: { select: { id: true, priceFrom: true } } },
  });
  const names = ['Иван Петров', 'Анна Смирнова', 'Олег Кузнецов', 'Елена Васильева', 'Дмитрий Соколов', 'Мария Попова', 'Сергей Новиков', 'Татьяна Морозова', 'Алексей Волков', 'Наталья Зайцева', 'Павел Лебедев', 'Юлия Козлова', 'Роман Орлов', 'Светлана Макарова', 'Михаил Фёдоров'];
  const statuses = ['NEW', 'NEW', 'IN_PROGRESS', 'IN_PROGRESS', 'DONE', 'REJECTED'] as const;
  const sources = ['TOUR_PAGE', 'HOMEPAGE', 'CUSTOM'] as const;
  const prefs = ['Медведи', 'Восхождения', 'Джипы', 'Сплавы', 'Вулканы', 'Фрирайд', 'Долина гейзеров'];

  for (let i = 0; i < 22; i++) {
    const source = sources[i % 3];
    const isCustom = source === 'CUSTOM';
    const tour = isCustom ? null : tourRows[rand(0, tourRows.length - 1)];
    const priceOption = tour?.priceOptions[rand(0, Math.max(0, tour.priceOptions.length - 1))];
    const people = rand(1, 6);
    await prisma.booking.create({
      data: {
        name: names[i % names.length],
        phone: `+7 9${rand(10, 99)} ${rand(100, 999)}-${rand(10, 99)}-${rand(10, 99)}`,
        contactMethod: pick(['Телефон', 'Telegram', 'WhatsApp'], 1)[0],
        source: source as any,
        tourId: tour?.id ?? null,
        priceOptionId: priceOption?.id ?? null,
        peopleCount: people,
        desiredDates: isCustom ? pick(['Июль 2026', 'Август 2026', 'Сентябрь 2026', 'не определился'], 1)[0] : null,
        isCustomRequest: isCustom,
        preferences: isCustom ? pick(prefs, rand(1, 4)) : [],
        comment: i % 3 === 0 ? 'Подскажите, насколько сложный маршрут для новичка?' : null,
        totalPrice: priceOption ? priceOption.priceFrom * people : null,
        status: statuses[i % statuses.length] as any,
        createdAt: new Date(Date.now() - rand(0, 30) * 86400000),
      },
    });
  }
  console.log('✅ Заявок: 22');

  console.log('🎉 Демо-сид завершён');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
