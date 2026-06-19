/**
 * БЕЗОПАСНЫЙ базовый сид для ПРОДА (компилируется в dist/database/seed.js).
 * Запускается из docker-entrypoint при старте (SEED_ON_START=true).
 *
 * ⚠️ ВАЖНО: здесь НЕТ удаления данных. Только upsert/create-if-missing,
 * поэтому безопасно выполняется на каждом рестарте и НЕ затирает контент.
 * Демо-данные с очисткой — отдельно в prisma/seed.ts (`npm run seed:demo`),
 * на проде запускать НЕЛЬЗЯ.
 */
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    // Администратор (создаётся/обновляется пароль; данные не трогаются)
    const email = process.env.ADMIN_EMAIL || 'admin@gory.local';
    const password = process.env.ADMIN_PASSWORD || 'admin12345';
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log(`✅ Администратор: ${email}`);

    // Базовые категории (только если отсутствуют)
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

    // Singleton контента компании — создаём ТОЛЬКО если ещё нет
    const company = await prisma.companyInfo.findFirst();
    if (!company) {
      await prisma.companyInfo.create({
        data: {
          heroTitle: 'Горы по колено',
          heroSubtitle: 'Авторские туры по Камчатке',
          stats: [
            { value: '6+', label: 'лет опыта' },
            { value: '2,5+ тыс.', label: 'туристов' },
            { value: '4.9', label: 'рейтинг' },
          ],
        },
      });
      console.log('✅ Контент компании создан');
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run()
  .then(() => console.log('🌱 Базовый сид завершён'))
  .catch((error) => {
    console.error('Ошибка базового сида:', error);
    process.exit(1);
  });
