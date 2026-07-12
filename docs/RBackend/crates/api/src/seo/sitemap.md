# [api/seo/sitemap.rs](/RBackend/crates/api/src/seo/sitemap.rs)

## Назначение
Генератор `sitemap.xml`: статичные страницы + динамические страницы предметов из `api_items_en.fb`.

## Ключевая функциональность
- `SitemapEntry { loc, changefreq, priority }`.
- `generate_sitemap(project_root, base_url)` — собирает URL через `middleware::decode_items` + `rbackend_core::SlugService`, рендерит XML.

## Связи
- Источник: [middleware/items.rs](/docs/RBackend/crates/middleware.md).
- Слаги: [core/slug.rs](/docs/RBackend/crates/core.md).
- Используется в [routes/sitemap.rs](../routes/sitemap.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
