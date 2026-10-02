# [middleware/error.rs](/RBackend/crates/middleware/src/error.rs)

## Назначение
Декодирование бинарной ошибки API (пак с идентификатором `"BIER"`) в `ErrorData`.

## API
- `ErrorData` — `code`, `detail`, `issues: Vec<String>`; сериализуется через `serde`.
- `decode_error(bytes)` — вызывает `read_api_error_bytes` из [pack/error](../../pack/src/error.md) и переносит поля один к одному. Ошибка разбора возвращается как `Err(String)` без изменений.

## Тесты
`rejects_invalid_error_pack` — произвольные байты дают `Err`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
