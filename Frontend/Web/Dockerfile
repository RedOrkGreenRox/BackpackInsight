FROM node:22.12-slim AS builder

WORKDIR /build

# Устанавливаем зависимости фронтенда и собираем статику на реальном Node,
# потому что Vite 8 требует Node >= 20.19 / 22.12.
COPY Frontend/Web/package*.json ./
RUN npm ci
COPY Frontend/Web ./
RUN npm run build && mkdir -p /build/dist_build && cp -R dist/. /build/dist_build/

FROM oven/bun:1.1-slim

WORKDIR /app

# Копируем исходный код для server.ts и static-ресурсов.
COPY Frontend/Web /app/Frontend/Web

# Копируем уже собранный frontend из builder stage.
COPY --from=builder /build/dist_build /app/dist_build

WORKDIR /app/Frontend/Web

# Рантайм-сервер больше не запускает Vite в watch-режиме внутри Bun,
# а только отдает уже собранные файлы и проксирует API.
CMD ["bun", "run", "server.ts"]
