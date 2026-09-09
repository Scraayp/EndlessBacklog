#!/bin/sh
set -e

cd /app/apps/backend

echo "Running database migrations (dialect: ${DB_DIALECT:-postgres})..."
pnpm exec sequelize-cli db:migrate

case "$1" in
  worker)
    echo "Starting EndlessBacklog worker..."
    exec node dist/worker.js
    ;;
  api|*)
    echo "Starting EndlessBacklog API..."
    exec node dist/server.js
    ;;
esac
