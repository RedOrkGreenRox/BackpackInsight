#!/bin/bash

set -e

echo "🚀 Развертывание Twitch Stream Monitor..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

# Создание необходимых директорий
mkdir -p logs data

# Проверка конфигурации
if [ ! -f "config/.env" ]; then
    echo "❌ Файл config/.env не найден"
    echo "Скопируйте config/.env.example в config/.env и настройте"
    exit 1
fi

if [ ! -f "config/channels.txt" ]; then
    echo "❌ Файл config/channels.txt не найден"
    exit 1
fi

# Сборка и запуск
echo "📦 Сборка образа..."
docker-compose build

echo "🚀 Запуск контейнера..."
docker-compose up -d

echo "✅ Развертывание завершено!"
echo "📊 Просмотр логов: docker-compose logs -f twitch-monitor"
