# 🧩 Бэкенд — точка входа

Стартовый узел [сетевой документации](../../README.md) для серверной части. Логика обработки данных, API и база данных.

## Карта бэкенда

### PlayerData (ядро)
*   [API Бэкенда (api.py)](PlayerData/api.md) — FastAPI-сервер: маршруты, безопасность, rate-limiting, синхронизация статики по SHA-256.
*   [Фабрика профилей (ProfileFactory.py)](PlayerData/services/ProfileFactory.md) — парсинг сырого JSON в объекты `Profile`/`Hero`/`Item`, кэш определений.
*   [Справочник предметов (data.py)](PlayerData/data.md) — таблицы прогрессии (опыт, карты, лиги, зоны), автозагрузка свежего `items_*.json`.
*   [Константы парсинга (constants.py)](PlayerData/constants.md) — ключи технических/игровых полей JSON.

### Модели данных (SQLModel)
*   [Модель Профиля (Profile.py)](PlayerData/models/Profile.md)
*   [Модель Героя (Hero.py)](PlayerData/models/Hero.md)
*   [Модель Предмета (Item.py)](PlayerData/models/Item.md)

### База данных
*   [Конфигурация БД (database.py)](DB/database.md) — engine PostgreSQL с fallback на SQLite.

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Фронтенд: [точка входа фронтенда](../Frontend/index.md).
*   Данные и механики: [узел Data](../data/index.md).

---

> 📌 **Подпись документации:** создано при аудите сетевой документации как точка входа (hub-узел), обещанная в README.
