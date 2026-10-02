# [api/routes/packs.rs](/RBackend/crates/api/src/routes/packs.rs)

## Назначение
Отдача готовых FlatBuffer-паков из `RBackend/generated` как есть, без декодирования. Маршруты защищены секретом ([security/secret](../security/secret.md)).

## Обработчики
- `items_pack(state, query)` — `GET /api/items.fb?lang=en|ru`. `ItemsPackQuery` содержит необязательный `lang`, по умолчанию `en`. Отдаёт `api_items_en.fb` или `api_items_ru.fb` (пак `"BIAI"`); другой язык — 400, `code` = `bad_request`.
- `catalog_summary_pack(state)` — `GET /api/catalog-summary.fb`, файл `catalog_summary.fb` (пак `"BICS"`).

## Внутреннее
- `pack_response(path)` — читает файл; ошибка чтения — 503, `code` = `pack_not_available`.
- `error_response(status, code, detail)` — тело из `build_api_error_bytes` ([pack/error](../../../pack/src/error.md)).
- `binary_response(status, bytes)` — `content-type: application/octet-stream`; только для 200 добавляет `Cache-Control: public, max-age=3600`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
