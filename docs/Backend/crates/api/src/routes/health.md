# [Пробы состояния сервера (health.rs)](/Backend/crates/api/src/routes/health.rs)

## Назначение
Пробы состояния для оркестратора и деплоя.

## Обработчики
- `health()` — всегда 200 и текст `ok service=api`; состояние не читает.
- `ready(state)` — читает `Backend/generated/catalog_summary.fb` через `read_catalog_summary` ([pack/catalog](../../../pack/src/catalog.md)). Успех — 200 и `ok catalog_items=<N> catalog_strings=0` (число строк всегда пишется нулём). Ошибка чтения — 503 и `not_ready <ошибка>`.
- `text_response(status, body)` — текстовый ответ с `charset=utf-8`.

## Тесты
`health_text_is_stable` сравнивает строковый литерал сам с собой и обработчик не вызывает, то есть ничего не проверяет.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
