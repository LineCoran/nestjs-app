import 'dotenv/config';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@gory.local';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';

  // Администратор
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`✅ Администратор: ${email}`);

  // Базовые категории
  const categories = [
    { name: 'Вулканы', slug: 'vulkany' },
    { name: 'Хели-ски', slug: 'heli-ski' },
    { name: 'Лето', slug: 'leto' },
    { name: 'Сплав', slug: 'splav' },
  ];
  for (const category of categories) {
    await prisma.tourCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Категорий: ${categories.length}`);

  // Справочник «что входит / не входит»
  const features = [
    { name: 'Трансфер', category: 'Транспорт' },
    { name: 'Питание', category: 'Питание' },
    { name: 'Проживание', category: 'Услуги' },
    { name: 'Авиабилеты', category: 'Транспорт' },
    { name: 'Страховка', category: 'Услуги' },
  ];
  for (const feature of features) {
    await prisma.tourFeature.upsert({
      where: { name: feature.name },
      update: {},
      create: feature,
    });
  }
  console.log(`✅ Фич: ${features.length}`);

  // Справочник тегов программы
  const tags = ['Акклиматизация', 'Завтрак', 'Обед', 'Ужин', 'Трансфер'];
  for (const name of tags) {
    await prisma.programTag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ Тегов программы: ${tags.length}`);

  // Справочник «что взять с собой»
  const whatToTake: Record<string, string[]> = {
    'Личные вещи': ['Паспорт', 'Аптечка', 'Солнцезащитный крем'],
    Снаряжение: ['Треккинговые ботинки', 'Спальник', 'Дождевик'],
  };
  for (const [categoryName, items] of Object.entries(whatToTake)) {
    const category = await prisma.whatToTakeCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    for (const itemName of items) {
      await prisma.whatToTakeItem.upsert({
        where: {
          categoryId_name: { categoryId: category.id, name: itemName },
        },
        update: {},
        create: { name: itemName, categoryId: category.id },
      });
    }
  }
  console.log('✅ Справочник «что взять» создан');

  // Singleton контента компании
  const company = await prisma.companyInfo.findFirst();
  if (!company) {
    await prisma.companyInfo.create({
      data: {
        heroTitle: 'Горы по колено',
        heroSubtitle: 'Авторские туры по Камчатке',
        aboutText: 'Мы организуем приключения на Камчатке с 2018 года.',
        stats: [
          { value: '6+', label: 'лет опыта' },
          { value: '2,5+ тыс.', label: 'туристов' },
          { value: '4.9', label: 'рейтинг' },
        ],
      },
    });
    console.log('✅ Контент компании создан');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
