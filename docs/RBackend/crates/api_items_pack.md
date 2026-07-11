# api items pack — typed FlatBuffer `/api/items.fb`

Active catalog data endpoint:

```text
GET /api/items.fb?lang=en|ru
```

Generated packs:

```text
RBackend/generated/api_items_en.fb
RBackend/generated/api_items_ru.fb
```

The pack is no longer a JSON-string compatibility wrapper. `api_items.fbs` contains typed recursive values (`ValueKind`, `Value`, `KeyValue`) so middleware can decode the catalog from FlatBuffer bytes without using the old `/api/items` JSON shape.

Removed:

```text
GET /api/items
api::catalog::items_json
raw JSON runtime fallback in api
```

Remaining JSON is only developer source input read by `builder` before `.fb` generation.

Active modules:

```text
RBackend/schemas/api_items.fbs
builder::catalog::api_items_flatbuffer
pack::api_items
middleware::decode_items
api::routes::packs
```

---
> 📌 **Подпись документации:** typed FlatBuffer `/api/items.fb`, 2026-07-11.
