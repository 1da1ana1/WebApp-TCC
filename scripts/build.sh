#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing API dependencies"
(cd apps/api && npm ci --no-audit --no-fund || npm install --no-audit --no-fund)

echo "==> Generating Prisma client"
(cd apps/api && npx prisma generate)

echo "==> Pushing Prisma schema to database"
(cd apps/api && npx prisma db push --accept-data-loss --skip-generate)

echo "==> Building API"
(cd apps/api && npm run build)

echo "==> Installing Web dependencies"
(cd apps/web && npm ci --no-audit --no-fund || npm install --no-audit --no-fund)

echo "==> Building Web"
(cd apps/web && npm run build)
