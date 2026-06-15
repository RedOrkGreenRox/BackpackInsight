# [Docker Compose — локальная разработка (docker-compose.yml)](../docker-compose.yml)

## Назначение
Оркестрация трёх сервисов для **локального** запуска: `db` (PostgreSQL 15), `backend` (FastAPI), `web` (фронтенд). С healthcheck и пробросом портов на localhost.

## Сервисы
*   **db**: `postgres:15-alpine`, порт `127.0.0.1:${POSTGRES_PORT:-5432}`, том `postgres_data`, монтирует [init_db.sql](backend/db/init_db.md), healthcheck `pg_isready`.
*   **backend**: сборка из [Backend/PlayerData/Dockerfile](backend/playerdata/Dockerfile.md), порт `127.0.0.1:8000`, ждёт healthy `db`, монтирует `./Backend`.
*   **web**: сборка из [Frontend/Web/Dockerfile](frontend/Dockerfile.md), порт `5080`, `BACKEND_API_URL=http://backend:8000`.

## Связи (Dependencies)
*   Переменные из `.env` ([пример](.env.md)). Серверный вариант — [docker-compose.server.yml](docker-compose.server.md).

## Связи (Dependencies)
*   Контекст сборки сужает [.dockerignore](.dockerignore.md); образы — [Dockerfile бэкенда](backend/playerdata/Dockerfile.md) и [Dockerfile фронтенда](frontend/Dockerfile.md).

## AI-контекст
*   Порты БД/бэкенда биндятся на `127.0.0.1` (наружу не торчат). Для прод-развёртывания используйте серверный compose (лимиты памяти, без открытых портов).

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
