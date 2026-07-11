# api binary packs — бинарные backend endpoints

Runtime backend→middleware/frontend contract is FlatBuffer only.

Active binary endpoints:

```text
GET /api/items.fb?lang=en|ru
GET /api/catalog-summary.fb
POST /api/profile.fb
```

They serve packs from:

```text
RBackend/generated/api_items_en.fb
RBackend/generated/api_items_ru.fb
RBackend/generated/catalog_summary.fb
```

Profile packs are built per request and persisted in PostgreSQL when DB is enabled.

Removed legacy endpoints:

```text
GET /api/items
GET /api/catalog-summary
POST /api/profile
POST /api/profile-summary
```

Content-Type:

```text
application/octet-stream
```

Errors on protected binary routes are also binary `ApiError` packs (`BIER`) where the request reached RBackend.

---
> 📌 **Подпись документации:** binary FlatBuffer API endpoints, 2026-07-11.
