# [Правила для краулеров (robots.txt)](../../../Frontend/Web/static/robots.txt)

## Назначение
Инструкции поисковым роботам: что индексировать, что запрещено, где sitemap.

## Содержимое
*   Явные правила для `Googlebot`, `Yandex`, `Bingbot` и `*`: `Allow: /`, запрет `/api/`, `/functions/`, `/admin/`, `/private/` (для `*` также `/*.json$`, `/src/`, `/vite/`).
*   `Allow: /images/`, `/static/`, `/manifest.json`.
*   Блок типовых ботовых путей (`/wp-admin/`, `/cgi-bin/`, `/tmp/`).
*   `Sitemap: .../sitemap.xml`, `Crawl-delay: 1`, `Host:` для Yandex.

## Связи (Dependencies)
*   `Sitemap` обслуживается функцией [sitemap.ts](../functions/api/sitemap.md).

## AI-контекст
*   API/функции закрыты от индексации намеренно. При добавлении новых приватных разделов добавляйте `Disallow` сюда.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
