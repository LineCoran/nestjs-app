/**
 * Базовый идемпотентный сид для ПРОДА (компилируется в dist/database/seed.js).
 * Запускается из entrypoint после миграций: создаёт администратора, базовые
 * категории и справочники, singleton контента компании. Безопасен на каждом старте.
 *
 * Отличие от prisma/seed*.ts: не требует tsx и исходников — работает из dist.
 */
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const email = process.env.ADMIN_EMAIL || 'admin@gory.local';
    const password = process.env.ADMIN_PASSWORD || 'admin12345';
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log(`✅ Администратор: ${email}`);

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
