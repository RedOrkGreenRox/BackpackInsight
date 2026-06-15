# 🧩 Бэкенд — точка входа

Стартовый узел [сетевой документации](../../README.md) для серверной части. Логика обработки данных, API и база данных.

## Карта бэкенда

### PlayerData (ядро)
*   [API Бэкенда (api.py)](playerdata/api.md) — FastAPI-сервер: маршруты, безопасность, rate-limiting, синхронизация статики по SHA-256.
*   [Фабрика профилей (ProfileFactory.py)](playerdata/services/ProfileFactory.md) — парсинг сырого JSON в объекты `Profile`/`Hero`/`Item`, кэш определений.
*   [Справочник предметов (data.py)](playerdata/data.md) — таблицы прогрессии (опыт, карты, лиги, зоны), автозагрузка свежего `items_*.json`.
*   [Константы парсинга (constants.py)](playerdata/constants.md) — ключи технических/игровых полей JSON.

### Модели данных (SQLModel)
*   [Модель Профиля (Profile.py)](playerdata/models/Profile.md)
*   [Модель Героя (Hero.py)](playerdata/models/Hero.md)
*   [Модель Предмета (Item.py)](playerdata/models/Item.md)

### База данных
*   [Конфигурация БД (database.py)](db/database.md) — engine PostgreSQL с fallback на SQLite.

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Фронтенд: [точка входа фронтенда](../frontend/index.md).
*   Данные и механики: [узел Data](../data/index.md).

---

> 📌 **Подпись документации:** создано при аудите сетевой документации как точка входа (hub-узел), обещанная в README.
