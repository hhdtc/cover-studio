# syntax=docker/dockerfile:1

# Builds the static site from this working tree, so no repository token is
# needed. For the alternative "build exactly what is on GitHub" pipeline see
# docker-compose.remote.yml.

# ---- build ---------------------------------------------------------------
FROM node:26.12.1-alpine AS build
WORKDIR /app

# Dependencies first: this layer only busts when the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- serve ---------------------------------------------------------------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
