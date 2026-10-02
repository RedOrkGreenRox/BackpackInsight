# [Проверка индексов (verify_indexes.py)](/scripts/verify_indexes.py)

## Назначение
Диагностический скрипт для PostgreSQL: проверяет расширение `pg_trgm`, печатает все индексы таблицы `itemdefinition` и пробует простой поиск по имени предмета.

## Как работает `verify()`
1. Подхватывает переменные из корневого `.env` (если файл есть) и собирает `DATABASE_URL` из `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SERVER` (по умолчанию `localhost`), `POSTGRES_PORT`, `POSTGRES_DB` (значения по умолчанию совпадают с docker-compose, см. [.env](../.env.md)).
2. Подключается через SQLAlchemy `create_engine`.
3. Ищет `pg_trgm` в `pg_extension` и сообщает, установлено ли расширение.
4. Читает `pg_indexes` для таблицы `itemdefinition` и печатает каждый индекс с пометкой `[GIN]` или `[BTREE]`; если GIN-индексов нет, предупреждает, что поиск может быть медленным.
5. Выполняет тестовый запрос `ILIKE '%Sword%'` по колонке `name`.
6. При ошибке подключения подсказывает запустить Docker.

## Соответствие текущей схеме
Таблица `itemdefinition` создаётся SQLx-миграцией [0002_normalized_tables.sql](../../RBackend/crates/db/migrations/pg/0002_normalized_tables.sql). Миграция заводит только B-tree-индексы (по колонкам rarity и connected_hero) и не создаёт расширение `pg_trgm`, поэтому на текущей схеме скрипт ожидаемо сообщит об отсутствии GIN-индексов. Скрипту нужен Python с пакетами `sqlalchemy` и драйвером PostgreSQL; в Rust-окружение они не входят.

---

> 📌 **Подпись документации:** переписано по исходнику и миграциям · 2026-10-02
