FROM oven/bun:1.1-slim

WORKDIR /app

# Копируем конфиги зависимостей
COPY Frontend/Web/package*.json ./

# Устанавливаем зависимости
RUN bun install

# Копируем исходный код
# Внимание: копируем в /app/Frontend/Web, чтобы сохранить структуру путей для server.ts
COPY Frontend/Web /app/Frontend/Web

# Создаем папку для сборки
RUN mkdir -p /app/dist_build

WORKDIR /app/Frontend/Web

# Запускаем сборку в фоне (watch) и сервер
# Используем exec form для безопасности
CMD ["sh", "-c", "bun x vite build --watch --config vite.config.ts --outDir /app/dist_build --emptyOutDir & bun run server.ts"]
