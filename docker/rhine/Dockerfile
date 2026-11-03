# Rhine Music (RonaldDeng/Rhine-Music-Demo, MIT) served inside the compose
# network. The repo is public, so the image clones it at build time instead of
# relying on a local checkout.
#
# Local patches applied to the upstream source (both recorded in
# docs/COLLECTED-PROJECTS.md):
#   1. lockfile mirror URLs are rewritten to registry.npmjs.org
#   2. the static server binds 0.0.0.0 instead of 127.0.0.1 so nginx can reach it

FROM node:22-alpine AS build
RUN apk add --no-cache git
WORKDIR /src
ARG REPO_URL=https://github.com/RonaldDeng/Rhine-Music-Demo.git
ARG REPO_REF=main
RUN git clone --depth 1 --branch "$REPO_REF" "$REPO_URL" .
RUN sed -i 's#https://registry\.npmmirror\.com#https://registry.npmjs.org#g' package-lock.json
RUN npm ci --no-audit --no-fund --registry=https://registry.npmjs.org
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /src /app
RUN sed -i "s/server.listen(port, '127.0.0.1'/server.listen(port, '0.0.0.0'/" scripts/music-server.mjs
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null 2>&1 || exit 1
CMD ["node", "scripts/music-server.mjs", "--port", "8080"]
