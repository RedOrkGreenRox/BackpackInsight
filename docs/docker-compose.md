# [Docker Compose — локальная разработка (docker-compose.yml)](../docker-compose.yml)

## Назначение
`docker-compose.yml` поднимает PostgreSQL + Rust-бэкенд (`RBackend/`) + фронтенд для локальной разработки. Используется скриптом [run_docker.py](scripts/run_docker.md).

## Сервисы

### 1. `db` (PostgreSQL)
*   Образ `postgres:15-alpine`.
*   Схема инициализируется через SQLx-миграции `RBackend/crates/db/migrations/pg/` (запускаются самим Rust-приложением при старте).
*   Том `postgres_data`, порт только на `127.0.0.1`.
*   Healthcheck `pg_isready`.

### 2. `backend` (Rust API)
*   Собирается из [RBackend/Dockerfile](RBackend/Dockerfile.md).
*   Ждёт `db: service_healthy`.
*   Запускает `api` crate (`RBackend/crates/api/src/main.md`).
*   Получает `POSTGRES_*`, `ROOT_API_SECRET`, `ROOT_ENV` из `.env`.

### 3. `web` (Frontend)
*   Собирается из [Dockerfile фронтенда](Frontend/Dockerfile.md).
*   Прокси `BACKEND_API_URL=http://backend:8090`.
*   Порт `5080`.

## Связи
*   Образы: [RBackend/Dockerfile](RBackend/Dockerfile.md), [Frontend/Dockerfile](Frontend/Dockerfile.md).
*   Миграции: [db crate](RBackend/crates/db.md).
*   Управление: [run_docker.py](scripts/run_docker.md).

## AI-контекст
*   Файл оптимизирован для разработки: порты локальные, монтируются исходники.
*   В production использует Cloudflare Pages + Rust-контейнер; смотрите [cloudflare_edge_security.md](RBackend/cloudflare_edge_security.md).

---
> 📌 **Подпись документации:** обновлено под Rust-бэкенд · 2026-07-12.
