# Схемы FlatBuffers (schemas/)

Каталог `Backend/schemas/` — контракты бинарных паков между сборкой, сервером и браузером. Rust-биндинги для используемых схем сгенерированы заранее и лежат в `Backend/crates/pack/src/generated` ([pack/lib](crates/pack/src/lib.md)); TS-биндинги фронтенда — в `Frontend/Web/ground/middleware/generated`. Бинарные паки собирает внешний `flatc` в утилите [builder](crates/build.md).

| Схема | Корень | Идентификатор | Файл / эндпоинт | Документ |
| :--- | :--- | :--- | :--- | :--- |
| `api_items.fbs` | `ApiItemsPack` | `"BIAI"` | `api_items_{en,ru}.fb`, `GET /api/items.fb` | [api_items](schemas/api_items.md) |
| `catalog.fbs` | `CatalogSummaryPack` | `"BICS"` | `catalog_summary.fb`, `GET /api/catalog-summary.fb` | [catalog](schemas/catalog.md) |
| `profile.fbs` | `ProfileView` | `"BIPR"` | ответ `POST /api/profile.fb` | [profile](schemas/profile.md) |
| `error.fbs` | `ApiError` | `"BIER"` | ошибки защищённых эндпоинтов | [error](schemas/error.md) |
| `localization.fbs` | `LocalePack` | `"BILC"` | не используется | [localization](schemas/localization.md) |
| `search.fbs` | `SearchIndexPack` | `"BISR"` | не используется | [search](schemas/search.md) |

Обзор бинарных контрактов API — [api_binary_packs](crates/api_binary_packs.md).

---

> 📌 **Подпись документации:** переписано по исходникам схем · 2026-10-02
