#!/bin/sh
set -e

echo "[entrypoint] Running prisma migrate deploy..."
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1) && MIGRATE_EXIT=0 || MIGRATE_EXIT=$?

if [ $MIGRATE_EXIT -ne 0 ]; then
  if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
    echo "[entrypoint] Database not baselined. Baselining existing migrations..."
    npx prisma migrate resolve --applied "202606230001_telegram_first_order_foundation"
    npx prisma migrate resolve --applied "202607130001_add_user_soft_delete"
    echo "[entrypoint] Baseline done. Running migrate deploy again..."
    npx prisma migrate deploy
  else
    echo "$MIGRATE_OUTPUT"
    exit 1
  fi
fi

echo "[entrypoint] Starting server..."
exec node dist/server.cjs
