# Twitch Stream Monitor Bot

Telegram бот для мониторинга Twitch стримов с управлением списком стримеров.

## Функциональность

### Команды бота
- `/start` - приветствие и справка
- `/list` - показать список отслеживаемых стримеров
- `/add @имя_стримера` - добавить стримера (только админы в группах)
- `/remove @имя_стримера` - удалить стримера (только админы в группах)

### Права доступа
- **Группы**: команды доступны только администраторам групп из белого списка
- **Личные сообщения**: команды доступны только пользователям из белого списка
- **Уведомления**: отправляются во все чаты из белого списка

## Установка и настройка

### 1. Клонирование и сборка
```bash
git clone <repository>
cd BackpackInsight/Frontend/Bot
chmod +x deploy.sh
./deploy.sh
```

### 2. Настройка переменных окружения
Создайте файл `config/.env`:
```env
# Twitch API
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id  # Опционально, для обратной совместимости

# Другие настройки
DB_PATH=/app/data/streams.db
LOG_LEVEL=INFO
```

### 3. Настройка белого списка
Отредактируйте файл `config/whitelist.json`:
```json
{
  "users": [123456789, 987654321],
  "groups": [-1001234567890, -1009876543210]
}
```

### 4. Настройка списка стримеров
Отредактируйте файл `config/channels.txt`:
```
trololollolollo
another_streamer
# комментарии начинаются с #
```

## Архитектура

### Основные компоненты
- **`main.py`** - точка входа и оркестрация
- **`telegram_bot.py`** - Telegram бот с командами
- **`monitor.py`** - мониторинг Twitch стримов
- **`database.py`** - управление базой данных SQLite
- **`notifications.py`** - уведомления (legacy)

### Поток данных
1. Telegram бот получает команды
2. Команды изменяют `config/channels.txt`
3. StreamMonitor читает файл и подписывается на EventSub
4. При начале/конце стрима отправляются уведомления

## Docker развертывание

### Сборка и запуск
```bash
docker-compose build
docker-compose up -d
```

### Просмотр логов
```bash
docker-compose logs -f twitch-monitor
```

### Остановка
```bash
docker-compose down
```

## Безопасность

### Многоуровневая защита
1. **Белый список** - только разрешенные пользователи/группы
2. **Проверка админа** - в группах только администраторы
3. **Валидация входа** - проверка формата команд
4. **Изолированные volume** - только чтение для config

### Ресурсные ограничения
- Память: 512MB лимит
- CPU: 0.5 ядра лимит
- Health check: каждые 30 секунд

## Мониторинг и отладка

### Логи
- Файл: `/app/logs/monitor.log`
- Консоль: stdout
- Docker: `docker-compose logs`

### Статистика
База данных SQLite содержит:
- Историю стримов
- Длительность стримов
- Максимальное количество зрителей

## API интеграции

### Twitch API
- EventSub подписки на события
- Автоматическое обновление токена
- Батчинг запросов (100 пользователей)

### Telegram Bot API
- Команды бота
- Уведомления о стримах
- HTML форматирование сообщений

## Разработка

### Локальный запуск
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

### Структура проекта
```
src/
├── main.py              # Точка входа
├── telegram_bot.py      # Telegram бот
├── monitor.py           # Twitch монитор
├── database.py          # База данных
└── notifications.py     # Уведомления

config/
├── .env                 # Переменные окружения
├── channels.txt         # Список стримеров
└── whitelist.json       # Белый список

data/                    # База данных SQLite
logs/                    # Логи приложения
```

## Траблшутинг

### Частые проблемы
1. **Бот не отвечает** - проверьте TELEGRAM_BOT_TOKEN
2. **Нет уведомлений** - проверьте TWITCH_CLIENT_ID/SECRET
3. **Access denied** - добавьте пользователя/группу в whitelist.json
4. **Docker ошибки** - проверьте права доступа к файлам

### Команды для отладки
```bash
# Проверка статуса контейнера
docker ps | grep twitch-monitor

# Просмотр логов
docker-compose logs twitch-monitor

# Перезапуск
docker-compose restart twitch-monitor
```

## Лицензия

MIT License
