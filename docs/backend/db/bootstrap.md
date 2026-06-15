# [Бутстрап схемы БД (bootstrap.py)](../../../Backend/DB/bootstrap.py)

## Назначение
Идемпотентная подготовка схемы БД перед стартом бэкенда. Решает **краш-луп**: голый `alembic upgrade head` падал с `table already exists`, если том БД (`postgres_data`) был создан ДО введения Alembic — таблицы есть, а строки в `alembic_version` нет. Падение Alembic обрывало цепочку запуска (`&&`), uvicorn не стартовал, порт 8000 не открывался, а `restart: always` зацикливал контейнер → внешне это выглядело как «connection refused».

## Связи (Dependencies)
*   [Конфигурация БД (database.py)](database.md): использует `engine`.
*   [Окружение Alembic (env.py)](migrations/env.md) и [миграции](migrations/versions/0001_initial_schema.md): через программный API Alembic (`command.upgrade` / `command.stamp`).
*   Запускается из [Dockerfile бэкенда](../playerdata/Dockerfile.md): `python -m Backend.DB.bootstrap` вместо прямого `alembic upgrade head`.
*   Та же логика, что и в CI [deploy.yml](../../.github/workflows/deploy.md) (блок «ALEMBIC BOOTSTRAP»), но работает и локально.

## Логика `main()`
1.  Инспектирует таблицы (`sqlalchemy.inspect`).
2.  **Нет `alembic_version`, но есть прикладные таблицы** (`profile`/`itemdefinition`/`hero`/`item`) → «старая» БД: `command.stamp(head)` (схема уже актуальна, не пересоздаём).
3.  **Иначе** (пустая БД или уже под Alembic) → `command.upgrade(head)`.
*   Работает для PostgreSQL и SQLite. При ошибке печатает компактное сообщение и выходит с кодом 1.

## AI-контекст
*   Сценарии проверены: чистая БД → upgrade (0001→0002); «грязная» БД без версии → stamp head; уже мигрированная → upgrade-no-op.
*   Если добавляете новую ревизию, ничего менять не нужно: на чистых/мигрированных БД сработает `upgrade`, на исторических — `stamp` поставит на текущий head (последующий запуск догонит новые ревизии).

---

> 📌 **Подпись документации:** создано вместе с фиксом краш-лупа бэкенда (alembic "table already exists").
