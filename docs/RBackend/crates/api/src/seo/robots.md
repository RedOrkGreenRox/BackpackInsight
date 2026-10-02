# [api/seo/robots.rs](/RBackend/crates/api/src/seo/robots.rs)

## Назначение
`generate_robots(base_url)` — текст robots.txt: всем агентам разрешён корень, закрыты `/api/`, `/admin/` и `/private/`, отдельно разрешены `/images/` и `/manifest.json`. Последняя строка — `Sitemap: <base>/sitemap.xml`; завершающий `/` у базового адреса отрезается.

## Тесты
`robots_points_to_sitemap` — при базе с завершающим слэшем ссылка на sitemap собирается без двойного слэша.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
