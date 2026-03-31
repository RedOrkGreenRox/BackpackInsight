#!/bin/bash

echo "🔄 Обновление Twitch Stream Monitor..."

# Остановка
docker-compose down

# Пересборка
docker-compose build --no-cache

# Запуск
docker-compose up -d

echo "✅ Обновление завершено!"
