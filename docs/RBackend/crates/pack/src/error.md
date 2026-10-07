# [Бинарная ошибка API (error.rs)](/RBackend/crates/pack/src/error.rs)

## Назначение
Бинарная ошибка API: запись и чтение FlatBuffer `ApiError` (схема `error.fbs`, идентификатор файла `"BIER"`). Все ошибки бинарных эндпоинтов отдаются в этом формате.

## API
- `ApiErrorPack` — `code` (машинный код, например `bad_request`), `detail` (текст), `issues` (список подробностей).
- `build_api_error_bytes(error)` — строит буфер с идентификатором и возвращает байты.
- `read_api_error_bytes(bytes)` — разбирает буфер обратно в `ApiErrorPack`; отсутствующий список `issues` становится пустым, ошибка разбора — `Err(String)`.

## Потребители
- Запись: [routes/profile_binary](../../api/src/routes/profile_binary.md), [routes/packs](../../api/src/routes/packs.md), [security/secret](../../api/src/security/secret.md), [security/rate_limit](../../api/src/security/rate_limit.md).
- Чтение: [middleware/error](../../middleware/src/error.md); на фронтенде — `decodeApiError` в [flatbuffer-decoders](../../../../Frontend/ground/middleware/flatbuffer-decoders.md).

## Тесты
`builds_and_reads_error` — круговая запись/чтение.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
