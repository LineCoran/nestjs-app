# Деплой бэкенда на сервер (Selectel)

Самодостаточный бэкенд: **Postgres + API + Caddy (HTTPS)** — всё в этой папке.
Фронт деплоится отдельно (Vercel/другой сервер) и ходит сюда по `https://<домен-API>`.

Файлы стека: `docker-compose.prod.yml`, `Caddyfile`, `Dockerfile`, `.env` (из `.env.example`).

---

## 0. Арендовать сервер (Selectel)
1. Облачный сервер, **Ubuntu 24.04 LTS**, 2 vCPU / 2–4 ГБ RAM / 20+ ГБ.
2. Добавить свой **SSH-ключ** при создании.
3. В фаерволе/Security Group открыть входящие **22, 80, 443**.
4. Запомнить публичный **IP**.

## 1. Docker
```bash
ssh root@<IP>
curl -fsSL https://get.docker.com | sh
docker compose version
```

## 2. Клонировать репозиторий бэкенда
```bash
git clone https://github.com/<owner>/<api-repo>.git /opt/tours-api
cd /opt/tours-api
```

## 3. Окружение
```bash
cp .env.example .env
nano .env
```
Минимум:
```ini
DOMAIN=:80                 # пока без домена — по IP/HTTP (HTTPS включим в шаге 5)
CORS_ORIGINS=              # пусто = пускать любой origin (на старте ок)
POSTGRES_PASSWORD=<надёжный_пароль>
JWT_SECRET=<openssl rand -hex 32>
ADMIN_EMAIL=admin@yourmail.ru
ADMIN_PASSWORD=<пароль_админа>
```

## 4. Запуск
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Само: соберётся образ API, поднимется Postgres, применятся миграции и базовый сид
(создаст администратора). Проверка:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
curl http://<IP>/api/tours          # JSON со списком туров
```

## 5. Домен + HTTPS
1. A-запись `api.вашдомен.ру → <IP>`, дождаться DNS.
2. `nano .env` → `DOMAIN=api.вашдомен.ру` → `docker compose -f docker-compose.prod.yml up -d`.
3. Caddy сам выпустит сертификат. Проверка: `curl https://api.вашдомен.ру/api/tours`.

## 6. Когда поднимете фронт (Vercel)
На фронте: `VITE_API_BASE_URL=https://api.вашдомен.ру`. На сервере:
```bash
nano .env      # CORS_ORIGINS=https://ваш-проект.vercel.app
docker compose -f docker-compose.prod.yml up -d
```

---

## Обновления / обслуживание
```bash
# ручной деплой
git pull && docker compose -f docker-compose.prod.yml up -d --build

# логи / рестарт
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml restart api

# бэкап БД
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U tours tours > backup_$(date +%F).sql
```

Данные — в volume'ах (`postgres_data`, `uploads`, `caddy_data`); переживают `down`,
удаляются только при `down -v`.

## Локальная разработка (без прод-стека)
```bash
docker compose up -d        # только Postgres (docker-compose.yml, порт 5433)
npm ci && npx prisma migrate dev && npm run seed
npm run start:dev           # API на :3000
```

## Автодеплой (опционально)
`.github/workflows/deploy.yml` собирает образ в `ghcr.io/<owner>/tours-api` и по push в
`main` деплоит по SSH. Секреты репозитория: `SSH_HOST`, `SSH_USER`, `SSH_KEY`,
`SSH_PORT` (опц.), `DEPLOY_PATH` (напр. `/opt/tours-api`).
