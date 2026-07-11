# [CD-пайплайн (deploy.yml)](../../../.github/workflows/deploy.yml)

## Назначение
GitHub Actions: непрерывное развёртывание. На `push` в `main` подключается по SSH к серверу и пересобирает/перезапускает контейнеры с накатом миграций Alembic.

## Подробное описание
*   Триггер: `push` в ветку `main`.
*   Через `appleboy/ssh-action` на сервере: `git reset --hard origin/main`, конвертация `.env` в Unix-формат.
*   **Alembic bootstrap**: определяет состояние БД (есть ли `alembic_version`/`profile`) и при необходимости делает `stamp head` для БД, существовавшей до Alembic.
*   Полная пересборка через [docker-compose.server.yml](../../docker-compose.server.md); миграции применяются при старте контейнера.

## Связи (Dependencies)
*   Секреты: `SERVER_IP`, `SSH_PRIVATE_KEY`. Бэкенд-образ накатывает миграции ([env.py](../../backend/db/migrations/env.md)).

## AI-контекст
*   Из-за `git reset --hard` любые незакоммиченные правки на сервере теряются. Bootstrap-логика Alembic защищает БД, заведённую до введения миграций (не пересоздаёт таблицы).

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
