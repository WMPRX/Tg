#!/bin/sh
set -e

# -----------------------------------------------------------------------------
# TgDir container entrypoint.
#   1. Apply pending Prisma migrations (or push schema on first boot)
#   2. Optionally run the seed (when RUN_SEED=true and DB is empty-ish)
#   3. Exec the main CMD (node server.js by default)
# -----------------------------------------------------------------------------

echo "▶ TgDir entrypoint"

if [ -z "$DATABASE_URL" ]; then
  echo "✗ DATABASE_URL is not set — aborting."
  exit 1
fi

# 1) Schema sync. Prefer `migrate deploy` if the migrations dir exists,
#    otherwise fall back to `db push` (safe for new deployments).
if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "▶ Running prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "▶ Running prisma db push (no migrations dir)"
  npx prisma db push --skip-generate --accept-data-loss=false || npx prisma db push --skip-generate
fi

# 2) Optional seed (runs only if RUN_SEED=true, default off).
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "▶ Running seed (RUN_SEED=true)"
  node ./node_modules/tsx/dist/cli.mjs ./prisma/seed.ts || echo "✗ Seed failed (continuing)"
fi

echo "▶ Starting app: $*"
exec "$@"
