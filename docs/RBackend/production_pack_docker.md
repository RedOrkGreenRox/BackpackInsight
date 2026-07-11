# RBackend production pack-only Docker layer

Эта контрольная точка делает `RBackend/api` production-ready replacement для старого Python backend на том же порту `8000`.

## Что добавлено

```text
RBackend/Dockerfile
ROOT_PROJECT_ROOT support
required pack verification at startup
compose backend service switched to RBackend/Dockerfile
```

## Production runtime

В Docker runtime задаётся:

```text
ROOT_ENV=production
ROOT_PROJECT_ROOT=/app
ROOT_API_ADDR=0.0.0.0:8000
```

Compose добавляет:

```text
ROOT_DB_ENABLED=true
POSTGRES_SERVER=db
ROOT_PUBLIC_BASE_URL=https://backpackinsight.pages.dev
API_SECRET/ROOT_API_SECRET from .env
```

Это означает:

```text
/api/items и /api/profile JSON endpoints не существуют;
/api/items.fb, /api/catalog-summary.fb и /api/profile.fb являются backend→middleware контрактом;
RBackend/generated/*.fb обязаны существовать при старте;
profile .fb сохраняется в PostgreSQL при включённой DB.
```

## Build stage

Docker build:

```text
копирует RBackend
копирует Backend/DB как source JSON input
копирует Frontend/Web/static/images/items для проверки картинок
запускает cargo test --workspace
запускает builder validate-all
строит все FlatBuffer packs
проверяет все FlatBuffer packs
собирает api release binary
```

Temporary JSON, который `builder` даёт `flatc`, удаляется сразу после генерации `.fb` и не попадает в runtime image.

## Runtime stage

Runtime image содержит:

```text
/app/api
/app/RBackend/generated/*.fb
```

Не содержит Python backend runtime и не использует JSON compatibility mode.

---
> 📌 **Подпись документации:** production pack-only Docker replacement для RBackend, 2026-07-11.
