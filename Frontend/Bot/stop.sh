#!/bin/bash

echo "🛑 Остановка Twitch Stream Monitor..."

# Остановка контейнеров
docker-compose down

echo "✅ Контейнеры остановлены!"

# Дополнительная информация
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "🔄 Для запуска используйте:"
echo "   docker-compose up -d"
echo ""
echo "📋 Для просмотра логов:"
echo "   docker-compose logs -f twitch-monitor"
