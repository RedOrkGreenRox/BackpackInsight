# [api/routes/sitemap.rs](/RBackend/crates/api/src/routes/sitemap.rs)

## Назначение
Axum-хендлер `GET /sitemap.xml` и `GET /api/sitemap`. Делегирует генерацию XML в [seo/sitemap.rs](../seo/sitemap.md).

## Ключевая функциональность
- `sitemap(state)` — XML-ответ со списком URL (статичные + динамические предметы).

## Связи
- Генератор: [seo/sitemap.rs](../seo/sitemap.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
