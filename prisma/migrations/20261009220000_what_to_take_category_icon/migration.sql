-- Иконка у категории «Что взять с собой» (оранжевая плашка на сайте и в админке).
ALTER TABLE "what_to_take_categories" ADD COLUMN "icon" TEXT;

-- Иконки существующим категориям — по смыслу.
UPDATE "what_to_take_categories" SET "icon" = 'file-text' WHERE "name" = 'Документы';
UPDATE "what_to_take_categories" SET "icon" = 'backpack' WHERE "name" = 'Личные вещи';
UPDATE "what_to_take_categories" SET "icon" = 'shirt' WHERE "name" = 'Одежда';
UPDATE "what_to_take_categories" SET "icon" = 'pickaxe' WHERE "name" = 'Снаряжение';

-- «Документ» в каталоге иконок ещё не было — добавляем, чтобы её можно было выбрать в админке.
INSERT INTO "site_icons" ("id", "name", "label")
VALUES (gen_random_uuid()::text, 'file-text', 'Документ, документы')
ON CONFLICT ("name") DO NOTHING;
