# [Эндпоинт robots.txt (robots.rs)](/RBackend/crates/api/src/routes/robots.rs)

## Назначение
`GET /robots.txt` — отдаёт текст из `generate_robots` ([seo/robots](../seo/robots.md)) для `public_base_url` из [state](../state.md), с `content-type: text/plain; charset=utf-8`. Ошибка сборки ответа превращается в 500 с текстом ошибки.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
