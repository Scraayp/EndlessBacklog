# syntax=docker/dockerfile:1

# --- Base: pnpm on Node 22 LTS ---------------------------------------------
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dependencies (cached layer) -------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY packages/config-typescript/package.json packages/config-typescript/
COPY packages/config-eslint/package.json packages/config-eslint/
COPY apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter @endlessbacklog/backend...

# --- Build -------------------------------------------------------------
FROM base AS build
COPY --from=deps /app /app
COPY packages/shared packages/shared
COPY packages/config-typescript packages/config-typescript
COPY apps/backend apps/backend
RUN pnpm --filter @endlessbacklog/shared build
RUN pnpm --filter @endlessbacklog/backend build

# --- Runtime -----------------------------------------------------------
# Copies the whole /app tree from the build stage rather than cherry-picking
# files: pnpm workspaces give every package its own node_modules (symlinks
# into the shared .pnpm store), so apps/backend/node_modules and
# packages/shared/node_modules both need to come along, not just the root
# one. sequelize-cli (needed at container start for migrations) is a
# devDependency, so this image intentionally keeps devDependencies rather
# than pruning them — simplicity over a smaller image for a self-hosted app.
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
COPY docker/backend-entrypoint.sh /app/docker/backend-entrypoint.sh

WORKDIR /app/apps/backend

EXPOSE 4000
ENTRYPOINT ["sh", "/app/docker/backend-entrypoint.sh"]
CMD ["api"]
