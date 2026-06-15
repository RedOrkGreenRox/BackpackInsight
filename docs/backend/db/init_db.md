# [Инициализация БД (init_db.sql)](../../../Backend/DB/init_db.sql)

## Назначение
SQL-скрипт первичной инициализации PostgreSQL. Монтируется в контейнер БД (`docker-entrypoint-initdb.d`) и выполняется при первом создании БД.

## Содержимое
*   `CREATE EXTENSION IF NOT EXISTS pg_trgm;` — включает расширение триграммного поиска, нужное для GIN-индексов из [миграции 0002](migrations/versions/0002_profile_indexes_and_timestamps.md).

## Связи (Dependencies)
*   Подключается в [docker-compose.yml](../../docker-compose.md) и [docker-compose.server.yml](../../docker-compose.server.md) как volume в `/docker-entrypoint-initdb.d/`.

## AI-контекст
*   Выполняется только при инициализации пустого тома БД. Само расширение также пытается создать миграция 0002 (`CREATE EXTENSION IF NOT EXISTS`) — дублирование безопасно (идемпотентно).

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
