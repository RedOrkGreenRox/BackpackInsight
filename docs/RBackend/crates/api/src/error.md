# [api/error.rs](/RBackend/crates/api/src/error.rs)

## Назначение
JSON-ошибка `ApiError { code, detail }`. Файл не объявлен как модуль в [lib](lib.md) (там нет `mod error`), поэтому он не компилируется и нигде не используется. Все ошибки защищённых эндпоинтов отдаются бинарным паком `"BIER"` через `build_api_error_bytes` из [pack/error](../../pack/src/error.md).

## Содержимое
- `ApiError` — `code: &'static str`, `detail: String`, выводит `Serialize`.
- `ApiError::new(code, detail)` — конструктор, `detail` принимает всё, что приводится к `String`.
- `ApiError::response(self, status)` — кортеж `(StatusCode, Json<ApiError>)`, который Axum умеет отдать как ответ. Реализации трейта ответа для самой структуры нет.

## Планируется
Решение по файлу не принято: либо подключить его в `lib.rs`, либо удалить как наследие JSON-API.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
