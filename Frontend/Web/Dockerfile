# --- ЭТАП 1: Сборка через Bun ---

FROM oven/bun:1.1-slim AS builder
WORKDIR /build

# Копируем только файлы зависимостей
COPY Frontend/Web/package*.json ./
# Очищаем кэш bun перед установкой, чтобы гарантировать свежие версии
RUN bun pm cache rm && bun install

# Копируем остальной код для сборки
COPY Frontend/Web/ ./
# Используем TS конфиг
RUN bun x vite build --outDir dist_build

# --- ЭТАП 2: Финальный образ ---
FROM python:3.13-slim
WORKDIR /app

# Устанавливаем Bun в финальный образ для работы --watch
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Настройки Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Ставим Python-зависимости (с защитой от сетевых ошибок)
COPY Frontend/Web/requirements.txt ./
RUN pip install --no-cache-dir --retries 10 --timeout 60 -r requirements.txt

# Копируем node_modules и собранный фронт ВНЕ папки Frontend/Web
COPY --from=builder /build/node_modules /app/node_modules
COPY --from=builder /build/dist_build /app/dist_build

# Копируем сам код проекта
COPY Frontend/Web /app/Frontend/Web

WORKDIR /app/Frontend/Web

# Добавляем флаг --config, чтобы Vite точно знал, где лежат инструкции,
# и исправляем пути для работы из текущей директории.
# ИСПРАВЛЕНО: vite.config.js -> vite.config.ts
CMD sh -c "bun x vite build --watch --config vite.config.ts --outDir /app/dist_build & python web.py"