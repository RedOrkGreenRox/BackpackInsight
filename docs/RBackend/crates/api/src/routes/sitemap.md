# [api/routes/sitemap.rs](/RBackend/crates/api/src/routes/sitemap.rs)

## Назначение
`GET /sitemap.xml` и `GET /api/sitemap` — один обработчик `sitemap`, который отдаёт XML из `generate_sitemap` ([seo/sitemap](../seo/sitemap.md)) с `content-type: application/xml; charset=utf-8`.

## Ошибки
Если пак предметов не читается или не декодируется, ответ — 500 с текстом ошибки (обычный текст, не пак ошибки).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
