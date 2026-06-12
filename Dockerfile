# ───────────────────────── build ─────────────────────────
FROM node:22-slim AS build
WORKDIR /app

# openssl нужен Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
# Генерируем клиент под целевую ОС (linux) и собираем
RUN npx prisma generate && npm run build

# ─────────────────────── production ──────────────────────
FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Собранное приложение + сгенерированный клиент (в dist/generated)
COPY --from=build /app/dist ./dist
# Схема, миграции и конфиг для `prisma migrate deploy`
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docker-entrypoint.sh ./

RUN mkdir -p uploads && chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
