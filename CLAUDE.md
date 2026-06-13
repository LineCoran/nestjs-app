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
- `PrismaService` — pg-адаптер (`@prisma/adapter-pg` + `pg`). `main.ts`: префикс `/api`, `ValidationPipe({whitelist,transform})`, CORS из `CORS_ORIGINS`.
- **WebSocket:** `modules/bookings/bookings.gateway.ts` — при создании заявки шлёт `booking:new` (JWT-handshake). Тот же порт 3000, путь `/socket.io`.
- Утилиты: `common/utils/slug.util.ts` (транслит кириллицы + уникальность), `common/dto/pagination.dto.ts` (limit ≤ 100).
- `tsconfig.build.json` исключает `prisma/` → сборка даёт `dist/main.js` (а не `dist/src/main.js`).

### Схема БД (важные решения — расходятся с feature.md, НЕ откатывать)

- `included`/`excluded` — **не массивы**, а общий справочник `TourFeature` + связь `TourFeatureLink { inclusion: INCLUDED|EXCLUDED, note, order }`.
- «Что взять» — `WhatToTakeCategory` 1—N `WhatToTakeItem` + `TourWhatToTakeLink`.
- Теги программы — справочник `ProgramTag`, m2m с `TourProgramItem`.
- Даты заездов — `TourSession { tourId, dateFrom, dateTo, availability }` напрямую у тура (НЕ вложены в цены). `TourPriceOption` (форматы/цены) независимы. `Booking` ссылается и на `sessionId`, и на `priceOptionId`.
- Создание/обновление тура: `features[]`, `whatToTakeItemIds[]`, `program[].tagIds[]`, `sessions[]`, `priceOptions[]`, `relatedTourIds[]`; вложенные коллекции пересоздаются в транзакции.

⚠️ `schema.prisma` пару раз откатывался стейл-буфером IDE — следить, чтобы не перезатёрся.

## Деплой

Самодостаточный (всё в этой папке): `docker-compose.prod.yml` (Postgres + api + Caddy `Caddyfile`, весь домен → api:3000) + `Dockerfile` + `docker-entrypoint.sh` (на старте `prisma migrate deploy` + компилированный базовый сид `dist/database/seed.js`). Env — `.env` из `.env.example`. CI/CD — `.github/workflows/{ci,deploy}.yml` (образ в `ghcr.io/<owner>/tours-api`, авто-деплой по SSH). Пошагово (Selectel) — **`SERVER_SETUP.md`**.

Прод-сборка не требует tsx: базовый сид компилируется (`src/database/seed.ts` → `dist/database/seed.js`).
