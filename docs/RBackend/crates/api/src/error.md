# [api/error.rs](/RBackend/crates/api/src/error.rs)

## Назначение
Унифицированная ошибка API: JSON-ответ `ApiError { code, detail }` для человекочитаемых эндпоинтов. Бинарные FlatBuffer-ошибки используют `pack::ApiErrorPack` (`BIER`), а не этот тип.

## Ключевая функциональность
- `ApiError` — структура ошибки с кодом и деталями.
- `IntoResponse` для Axum: рендерит `StatusCode` + `Json<ApiError>`.

## Связи
- Используется только в защищённых текстовых эндпоинтах.
- Бинарные эндпоинты возвращают `pack::build_api_error_bytes` (см. [pack](../../pack.md)).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
