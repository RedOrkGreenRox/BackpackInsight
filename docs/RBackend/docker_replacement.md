# RBackend Docker replacement

Эта контрольная точка заменяет Docker backend image со старого Python backend на Rust `RBackend/api`.

## Что сохраняется

Backend service сохраняет внешний контракт инфраструктуры:

```text
container_name: backpack_insight_backend
port: 8000
```

То есть адрес/порт backend остаётся прежним, а внутри контейнера теперь Rust binary.

## Compose

Активный Compose теперь один:

```text
docker-compose.yml
```

`docker-compose.server.yml` удалён. Local/server режим выбирает `scripts/run_docker.py` через env defaults. Подробнее: `docs/RBackend/compose_merge_plan.md`.

Local mode запускает:

```text
db
backend
web
```

Server mode запускает только backend-side services:

```text
db
backend
```

`web` в compose — только local profile. Production frontend по-прежнему живёт на Cloudflare Pages.

## Что заменено

```text
Backend/PlayerData/Dockerfile -> RBackend/Dockerfile
```

Backend build stage:

```text
cargo test --workspace
builder validate-all
builder build-all-packs
builder verify-all-packs
cargo build --release -p api
```

Backend runtime stage:

```text
/app/api
/app/RBackend/generated/*.fb
```

Runtime env в образе:

```text
ROOT_PROJECT_ROOT=/app
ROOT_ENV=production
ROOT_API_ADDR=0.0.0.0:8000
```

`ROOT_LEGACY_JSON` и `ROOT_DATA_MODE` удалены: JSON runtime режима больше нет, API pack-only by construction.

## Local mode

```text
ROOT_ENV=development
BACKEND_BIND=127.0.0.1
POSTGRES_BIND=127.0.0.1
FRONTEND_BIND=127.0.0.1
FRONTEND_PORT=5080
ROOT_DB_ENABLED=true
```

Frontend container serves the built SPA on:

```text
http://127.0.0.1:5080
```

and proxies binary API calls to:

```text
http://backend:8000
```

## Server mode

```text
ROOT_ENV=production
BACKEND_BIND=0.0.0.0
POSTGRES_BIND=127.0.0.1
ROOT_DB_ENABLED=true
ROOT_PUBLIC_BASE_URL=https://backpackinsight.pages.dev
API_SECRET/ROOT_API_SECRET=<server-side only>
```

Server mode does not start the web container; Cloudflare Pages deploys and caches frontend assets.

---
> 📌 **Подпись документации:** Docker replacement старого Python backend на RBackend, local frontend + server backend-only mode, 2026-07-11.
