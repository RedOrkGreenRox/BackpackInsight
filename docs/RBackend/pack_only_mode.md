# Pack-only RBackend runtime

`api` теперь работает по правилу:

```text
backend→middleware/frontend data contract = FlatBuffer only
legacy JSON endpoints = removed, not toggled
raw item JSON = build input only
user profile JSON = upload input only
```

## Runtime variables

Активные переменные для backend runtime:

```text
ROOT_ENV=production|development
ROOT_API_ADDR=0.0.0.0:8000
ROOT_PROJECT_ROOT=/app
ROOT_PUBLIC_BASE_URL=https://backpackinsight.pages.dev
ROOT_DB_ENABLED=true
ROOT_API_SECRET/API_SECRET=<server-side only>
```

Удалённые переменные:

```text
ROOT_DATA_MODE
ROOT_LEGACY_JSON
```

Их больше не нужно выставлять: JSON runtime mode не существует.

## Removed endpoints

```text
GET  /api/items
GET  /api/catalog-summary
POST /api/profile
POST /api/profile-summary
```

## Current binary endpoints

```text
GET  /api/items.fb?lang=en|ru       # BIAI
GET  /api/catalog-summary.fb        # BICS
POST /api/profile.fb                # BIPR or BIER
```

## JSON still allowed only here

```text
Backend/DB/*.json                   # developer source files, build input
POST /api/profile.fb body           # user-provided game profile JSON
```

Temporary JSON files used by `flatc` are deleted immediately after `.fb` generation and are not runtime artifacts.

---
> 📌 **Подпись документации:** pack-only RBackend runtime, 2026-07-11.
