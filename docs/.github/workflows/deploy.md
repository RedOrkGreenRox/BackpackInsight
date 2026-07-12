# [CD-пайплайн (deploy.yml)](/.github/workflows/deploy.yml)

## Назначение
GitHub Actions: непрерывное развёртывание. На `push` в `main` подключается по SSH к серверу и пересобирает/перезапускает контейнеры Rust-бэкенда. SQLx-миграции применяются при старте контейнера (см. [db crate](../../RBackend/crates/db.md)).

## Подробное описание
*   Триггер: `push` в ветку `main`.
*   Через `appleboy/ssh-action` на сервере: `git reset --hard origin/main`, конвертация `.env` в Unix-формат.
*   **Alembic bootstrap**: определяет состояние БД (есть ли `alembic_version`/`profile`) и при необходимости делает `stamp head` для БД, существовавшей до Alembic.
*   Полная пересборка через [docker-compose.yml](../../docker-compose.md); SQLx-миграции (`RBackend/crates/db/migrations/`) применяются при старте контейнера.

## Связи (Dependencies)
*   Секреты: `SERVER_IP`, `SSH_PRIVATE_KEY`. Rust-контейнер запускает миграции ([db/src/lib.rs](../../RBackend/crates/db.md)).

## AI-контекст
*   Из-за `git reset --hard` любые незакоммиченные правки на сервере теряются. SQLx-миграции идемпотентны (`IF NOT EXISTS`), безопасны при каждом старте.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
