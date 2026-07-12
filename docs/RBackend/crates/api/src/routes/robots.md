# [api/routes/robots.rs](/RBackend/crates/api/src/routes/robots.rs)

## Назначение
Axum-хендлер `GET /robots.txt`. Делегирует генерацию в [seo/robots.rs](../seo/robots.md).

## Ключевая функциональность
- `robots(state)` — text/plain ответ с `User-agent: *` + `Sitemap: ...`.

## Связи
- Генератор: [seo/robots.rs](../seo/robots.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
