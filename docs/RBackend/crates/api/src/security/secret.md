# [Проверка внутреннего секрета (secret.rs)](/RBackend/crates/api/src/security/secret.rs)

## Назначение
Слой `require_api_secret`: пропускает к `/api/*.fb` только запросы с верным внутренним секретом в заголовке `x-internal-secret` (константа `INTERNAL_SECRET_HEADER`). Секрет добавляет прокси на краю сети — см. [cloudflare_edge_security](../../../../cloudflare_edge_security.md).

## Поведение
- Если `api_secret` в [state](../state.md) не задан, запрос проходит без проверки (в production это запрещено при старте, если не включён явный обход).
- Заголовок есть и совпадает — запрос проходит.
- Иначе — 403 с паком ошибки: `code` = `forbidden`, `detail` = «Direct access forbidden».

## Внутреннее
- `binary_error(status, code, detail)` — ответ с паком ошибки из [pack/error](../../../pack/src/error.md) и `content-type: application/octet-stream`.
- `secret_eq(left, right)` — сравнение за постоянное время через `ConstantTimeEq` из crate subtle; разная длина сразу даёт `false`.

## Тесты
`equal_secrets_match`, `different_case_does_not_match`, `different_length_does_not_match`, `empty_vs_non_empty_does_not_match`, `both_empty_match`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
