# [Схема ошибки API (error.fbs)](/RBackend/schemas/error.fbs)

## Назначение
Схема бинарной ошибки API (пространство имён `BackpackInsight.Error`, корень `ApiError`, идентификатор `"BIER"`). Ею отвечают все защищённые эндпоинты при отказе.

## Таблица `ApiError`
- `code` — машинный код (`bad_request`, `forbidden`, `rate_limited`, `pack_not_available`), обязательный.
- `detail` — текст для человека, обязательный.
- `issues` — список подробностей, необязательный.

## Кто пишет и читает
- Запись: [pack/error](../crates/pack/src/error.md), вызовы — в [routes/packs](../crates/api/src/routes/packs.md), [routes/profile_binary](../crates/api/src/routes/profile_binary.md), [security/secret](../crates/api/src/security/secret.md), [security/rate_limit](../crates/api/src/security/rate_limit.md).
- Чтение: [middleware/error](../crates/middleware/src/error.md); в браузере — [flatbuffer-decoders](../../Frontend/ground/middleware/flatbuffer-decoders.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
