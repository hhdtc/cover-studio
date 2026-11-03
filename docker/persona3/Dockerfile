# Persona3-like-web (Masonli1203, MIT) as an internal compose service.
#
# The repo ships only original placeholder art, so building it here adds no
# third-party game assets. Serve it behind nginx on p3.localhost; no host port
# is published.

FROM node:22-alpine AS build
RUN apk add --no-cache git
WORKDIR /app
ARG REPO_URL=https://github.com/Masonli1203/Persona3-like-web.git
ARG REPO_REF=main
RUN git clone --depth 1 --branch "$REPO_REF" "$REPO_URL" .
RUN npm ci --no-audit --no-fund --registry=https://registry.npmjs.org
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080
COPY --from=build /app ./
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1
CMD ["npx", "next", "start", "--hostname", "0.0.0.0", "--port", "8080"]
