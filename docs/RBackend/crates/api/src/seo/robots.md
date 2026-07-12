# [api/seo/robots.rs](/RBackend/crates/api/src/seo/robots.rs)

## Назначение
Генератор `robots.txt`: `User-agent: *`, `Disallow: /api/`, `Allow: /images/`, ссылка на sitemap.

## Ключевая функциональность
- `generate_robots(base_url)` — возвращает строку `text/plain`.
- Юнит-тест проверяет наличие `Sitemap:` строки.

## Связи
- Используется в [routes/robots.rs](../routes/robots.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
