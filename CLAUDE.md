# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это

Бэкенд проекта «Горы по колено» (сайт бронирования туров по Камчатке) — **NestJS 11 + Prisma 7 + PostgreSQL + socket.io**. Обслуживает публичный сайт и админку (фронт — отдельный репозиторий, ходит сюда по HTTP(S)). Спецификация — `feature.md`.

## Команды

```bash
# Локальная разработка
docker compose up -d                # только Postgres (порт 5433), env из .env
npm ci
npx prisma migrate dev              # миграции
npm run seed                        # базовые данные + админ (admin@gory.local / admin12345)
npm run seed:demo                   # МНОГО тестовых данных (через tsx)
npm run start:dev                   # API на :3000, префикс /api

npm run build                       # nest build → dist/main.js
npm run lint
```
Сиды (`prisma/seed.ts`) запускаются через **tsx** (не ts-node — генерированный клиент использует `.js`-require). `npm run start:prod` = `node dist/main`.

## Архитектура

- Модули в `src/modules/<name>/`, у большинства **раздельные публичный и админский контроллеры** (`/api/...` без авторизации, `/api/admin/...` под `JwtAuthGuard` из `modules/auth`).
- Модули: `auth` (JWT), `tours`, `tour-categories`, `tour-features` (справочник), `program-tags` (справочник), `what-to-take` (категории+пункты), `blog`, `guides`, `company-info` (singleton), `bookings`, `upload` (multipart jpg/png/webp в `/uploads`, раздаётся ServeStatic).
- **Умный поиск:** `GET /api/tours/search?q=&limit=` (`ToursService.searchPublished` + `common/utils/search.util.ts`). Без full-text и расширений Postgres: нормализация (ё→е, латинская раскладка «rfvxfnrf» → «камчатка»), лёгкий стемминг окончаний, `contains` по названию/описанию/программе/категории/сезону/форматам/справочникам, скоринг по весу поля в приложении. Если по всем словам пусто — повтор по любому из слов (`relaxed: true`). Роут объявлен **до** `:slug`.
- `PrismaService` — pg-адаптер (`@prisma/adapter-pg` + `pg`). `main.ts`: префикс `/api`, `ValidationPipe({whitelist,transform})`, CORS из `CORS_ORIGINS`.
- **WebSocket:** `modules/bookings/bookings.gateway.ts` — при создании заявки шлёт `booking:new` (JWT-handshake). Тот же порт 3000, путь `/socket.io`.
- Утилиты: `common/utils/slug.util.ts` (транслит кириллицы + уникальность), `common/dto/pagination.dto.ts` (limit ≤ 100).
- `tsconfig.build.json` исключает `prisma/` → сборка даёт `dist/main.js` (а не `dist/src/main.js`).

### Схема БД (важные решения — расходятся с feature.md, НЕ откатывать)

- `included`/`excluded` — **не массивы**, а общий справочник `TourFeature` + связь `TourFeatureLink { inclusion: INCLUDED|EXCLUDED, note, order }`.
- «Что взять» — `WhatToTakeCategory` 1—N `WhatToTakeItem` + `TourWhatToTakeLink`.
- Теги программы — справочник `ProgramTag`, m2m с `TourProgramItem`.
- Даты заездов — `TourSession { tourId, dateFrom, dateTo, availability, priceOptionId? }`: заезд **привязан к формату** (`TourPriceOption`), у джипов и вертолёта свои даты. `priceOptionId = null` — заезд общий для всех форматов (так лежат данные, заведённые до привязки). FK `onDelete: Cascade` — удалили формат, ушли и его даты. `Booking` ссылается и на `sessionId`, и на `priceOptionId`; заявку с заездом чужого формата сервис не принимает.
- **Параметры тура — у формата**: `durationDays`, `groupSize` (текст «до 4 чел.»), `difficulty`, `order` лежат в `TourPriceOption`, на `Tour` их нет. Ближайшая дата не хранится — считается из заездов формата. Карточкам в списках/поиске/«чаще выбирают» сервис добавляет сводку `durationDays/groupSize/difficulty` самого дешёвого формата (`withFormatSummary`). Фильтры каталога по формату/цене/сложности/длительности проверяются на одном и том же формате.
- `ImportantInfoItem.type` — `INFO|WARNING|SUCCESS|NEUTRAL` = цвет алерта на сайте (голубой/оранжевый/зелёный/бежевый); `icon` — lucide-иконка алерта (пусто — «!»).
- `Tour.seasonLabel` — текст белого бейджа на карточке («Лето», «с 2027 года»), пусто — бейдж показывает `season`. Отдельное поле, потому что по `season` фильтруется каталог. `null` в запросе очищает.
- `Tour.highlights` (Json, default `[]`) — плашка характеристик под заголовком тура, до 5 пунктов `{ icon?, title, value, label? }` (`TourHighlightDto`, лимиты `TOUR_HIGHLIGHT_LIMITS`: 18/12/22 символов). Заполняется в админке, от формата не зависит; пустой массив — фронт собирает плашку из формата.
- `SiteIcon { name unique (kebab-case lucide), label? }` — каталог иконок для выбора в админке (модуль `site-icons`, только админские эндпоинты). Удаление из каталога не трогает уже сохранённые `icon` у гидов/услуг. Миграция заполняет стартовый набор и уже используемые иконки.
- `CompanyInfo.banners` (Json) — настройки баннеров главной `{ cta, gift }` (`HomeBannerDto`: тексты, hex-цвета, height 240–900, decor/animated/showLogo, до 2 кнопок). PATCH сливает по ключам — присланный баннер заменяется целиком, другой не трогается. Значения по умолчанию живут на фронте (`entities/banners`).
- `CompanyInfo.catalogDefault` (Json, default `{}`) — категория каталога по умолчанию `{ mode: season|category|all, categoryId, months: { "1".."12": categoryId|null } }` (`CatalogDefaultDto`, форму приводит `sanitizeCatalogDefault` в сервисе). Выбор по текущему месяцу и заготовка по названиям — на фронте.
- `BlogPost.blocks` (Json, default `[]`) — тело статьи из блоков `{ id, type, ... }`; форму каждого блока приводит `sanitizeBlocks` (`modules/blog/blog-blocks.ts`, неизвестный тип — 400). `content` (HTML) устарел: миграция `blog_blocks` перенесла его в блок `text`. `lead` — абзац под заголовком, `coverCaption` — подпись обложки. `GET /blog/:slug` добавляет `tours` — карточки опубликованных туров из блоков `tours` (`ToursService.findCardsByIds`, модуль туров экспортирует сервис). `BlogPost.sidebar` (Json, default `{}`) — боковая панель `{ showToc, authorLabel, authorText, toursTitle, tourIds ≤6, buttonLabel, buttonHref }` (`sanitizeSidebar`), её туры тоже попадают в `tours`; `authorId` → `Guide` (`onDelete: SetNull`), `GET /blog/:slug` отдаёт `author`.
- Создание/обновление тура: `features[]`, `whatToTakeItemIds[]`, `program[].tagIds[]`, `sessions[]`, `priceOptions[]`, `relatedTourIds[]`; вложенные коллекции пересоздаются в транзакции.
- ⚠️ `sessions[].priceOptionIndex` — **индекс в `priceOptions` этого же запроса**, а не id: форматы при сохранении пересоздаются, id известны только после вставки. Поэтому форматы и заезды пишет `ToursService.writeFormatsWithSessions` (по одному, вне `buildNestedWrites`), а PATCH требует передавать `priceOptions` и `sessions` вместе — иначе 400, чтобы даты не потерялись молча.

⚠️ `schema.prisma` пару раз откатывался стейл-буфером IDE — следить, чтобы не перезатёрся.

## Деплой

Самодостаточный (всё в этой папке): `docker-compose.prod.yml` (Postgres + api + Caddy `Caddyfile`, весь домен → api:3000) + `Dockerfile` + `docker-entrypoint.sh` (на старте `prisma migrate deploy` + компилированный базовый сид `dist/database/seed.js`). Env — `.env` из `.env.example`. CI/CD — `.github/workflows/{ci,deploy}.yml` (образ в `ghcr.io/<owner>/tours-api`, авто-деплой по SSH). Пошагово (Selectel) — **`SERVER_SETUP.md`**.

Прод-сборка не требует tsx: базовый сид компилируется (`src/database/seed.ts` → `dist/database/seed.js`).
