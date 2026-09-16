-- Каталог иконок сайта: отобранный список иконок lucide для выбора в админке.
-- CreateTable
CREATE TABLE "site_icons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_icons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_icons_name_key" ON "site_icons"("name");

-- Стартовый набор под туры по Камчатке.
INSERT INTO "site_icons" ("id", "name", "label") VALUES
  (gen_random_uuid()::text, 'mountain', 'Гора'),
  (gen_random_uuid()::text, 'mountain-snow', 'Заснеженная гора'),
  (gen_random_uuid()::text, 'flame', 'Вулкан, огонь'),
  (gen_random_uuid()::text, 'tent', 'Палатка, кемпинг'),
  (gen_random_uuid()::text, 'snowflake', 'Снег, зима'),
  (gen_random_uuid()::text, 'sun', 'Солнце, лето'),
  (gen_random_uuid()::text, 'waves', 'Океан, волны'),
  (gen_random_uuid()::text, 'droplets', 'Источники, вода'),
  (gen_random_uuid()::text, 'thermometer', 'Температура, погода'),
  (gen_random_uuid()::text, 'trees', 'Лес'),
  (gen_random_uuid()::text, 'fish', 'Рыбалка'),
  (gen_random_uuid()::text, 'binoculars', 'Наблюдение, медведи'),
  (gen_random_uuid()::text, 'camera', 'Фото'),
  (gen_random_uuid()::text, 'compass', 'Компас, маршрут'),
  (gen_random_uuid()::text, 'map-pin', 'Место, точка на карте'),
  (gen_random_uuid()::text, 'footprints', 'Треккинг, пешком'),
  (gen_random_uuid()::text, 'backpack', 'Рюкзак, снаряжение'),
  (gen_random_uuid()::text, 'bike', 'Велосипед'),
  (gen_random_uuid()::text, 'car', 'Джип, автомобиль'),
  (gen_random_uuid()::text, 'bus', 'Автобус, трансфер'),
  (gen_random_uuid()::text, 'plane', 'Вертолёт, самолёт'),
  (gen_random_uuid()::text, 'ship', 'Корабль'),
  (gen_random_uuid()::text, 'sailboat', 'Лодка, сплав'),
  (gen_random_uuid()::text, 'utensils', 'Питание'),
  (gen_random_uuid()::text, 'bed', 'Проживание'),
  (gen_random_uuid()::text, 'wifi', 'Wi-Fi, связь'),
  (gen_random_uuid()::text, 'shield-check', 'Безопасность, страховка'),
  (gen_random_uuid()::text, 'users', 'Группа'),
  (gen_random_uuid()::text, 'heart', 'Забота'),
  (gen_random_uuid()::text, 'star', 'Звезда, лучшее')
ON CONFLICT ("name") DO NOTHING;

-- Иконки, которые уже выбраны на сайте (услуги и теги гидов), — чтобы ничего не выпало из каталога.
INSERT INTO "site_icons" ("id", "name")
SELECT gen_random_uuid()::text, icon
FROM (
  SELECT DISTINCT "icon" AS icon FROM "tour_features" WHERE "icon" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  UNION
  SELECT DISTINCT tag->>'icon' FROM "guides", jsonb_array_elements("tags") AS tag
  WHERE jsonb_typeof("tags") = 'array' AND tag->>'icon' ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
) AS used
ON CONFLICT ("name") DO NOTHING;
