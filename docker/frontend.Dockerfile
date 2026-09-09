# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY packages/config-typescript/package.json packages/config-typescript/
COPY packages/config-eslint/package.json packages/config-eslint/
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile --filter @endlessbacklog/frontend...

FROM base AS build
# Baked into the static bundle at build time — see README's "Configuration"
# table and wiki/Self-Hosting-Configuration.md for why these are build args
# rather than runtime env vars (no reverse proxy means the browser talks to
# the backend on its own origin/port).
ARG VITE_API_URL=http://localhost:4000
ARG VITE_SOCKET_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

COPY --from=deps /app /app
COPY packages/shared packages/shared
COPY packages/config-typescript packages/config-typescript
COPY apps/frontend apps/frontend
RUN pnpm --filter @endlessbacklog/shared build
RUN pnpm --filter @endlessbacklog/frontend build

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
