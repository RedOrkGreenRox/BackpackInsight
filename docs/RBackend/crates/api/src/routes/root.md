# [api/routes/root.rs](/RBackend/crates/api/src/routes/root.rs)

## Назначение
`GET /` — проверка, что сервер отвечает: текст константы `MESSAGE` («Backpack Insight API is running») с `content-type: text/plain; charset=utf-8`.

## Функции
- `root()` — обработчик.
- `text_response(body)` — ответ 200 с текстовым заголовком.

## Тесты
`home_message_matches_current_backend` — текст константы не изменился.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
