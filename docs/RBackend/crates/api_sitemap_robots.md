# api sitemap and robots — backend SEO endpoints

Эта точка добавляет backend-only SEO endpoints в `api`:

```text
GET /sitemap.xml
GET /api/sitemap
GET /robots.txt
```

Причина: в текущем production `/sitemap.xml` отдаёт SPA HTML, хотя `robots.txt` указывает именно на `/sitemap.xml`. Новый backend должен уметь отдавать корректный XML sitemap напрямую.

Структура:

```text
seo/sitemap.rs        генерация XML sitemap
seo/robots.rs         генерация robots.txt
routes/sitemap.rs     Axum routes для /sitemap.xml и /api/sitemap
routes/robots.rs      Axum route для /robots.txt
```

`ROOT_PUBLIC_BASE_URL` задаёт публичный base URL. По умолчанию:

```text
https://backpackinsight.pages.dev
```

Sitemap строится из текущего compatibility catalog и использует `SlugService` из `core`.

---
> 📌 **Подпись документации:** sitemap/robots backend endpoints для `api`, 2026-07-06.
