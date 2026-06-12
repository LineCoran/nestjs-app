#!/bin/sh
set -e

echo "▶ Применение миграций (prisma migrate deploy)…"
npx prisma migrate deploy

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "▶ Базовый сид (admin + категории + контент)…"
  node dist/database/seed.js
fi

echo "▶ Запуск API…"
exec node dist/main
