# [Перенаправления Cloudflare (_redirects)](/Frontend/Web/static/_redirects)

## Назначение
Правила перенаправлений Cloudflare Pages. Файл копируется в корень собранного сайта вместе с остальной статикой.

## Ключевое
- `/sitemap.xml /api/sitemap 200` — перезапись без смены адреса (код `200`): по адресу `/sitemap.xml` отдаётся ответ `/api/sitemap`, который проксирует [api/[[path]].ts](../functions/api/[[path]].md) на бэкенд.

## Связи
- Заголовки статики: [static/_headers](_headers.md).
- Генерация sitemap на бэкенде: [api_sitemap_robots.md](/docs/Backend/crates/api_sitemap_robots.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
