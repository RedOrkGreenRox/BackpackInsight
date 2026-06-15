# [Генератор sitemap — Cloudflare Function (sitemap.ts)](../../../../Frontend/Web/functions/api/sitemap.ts)

## Назначение
Cloudflare Function `GET /api/sitemap`: динамически строит XML-карту сайта — статические страницы + страница каждого предмета (по слагу).

## Связи (Dependencies)
*   Тип `ItemDefinition` из [ItemsBranch](../../ground/branches/items/ItemsBranch.md).
*   Данные: `GET ${BASE_URL}/api/items`.
*   Логика слага — локальная копия (ср. [SlugService](../../ground/utils/SlugService.md)).

## Подробное описание
*   `toSlug(name)` — нормализация имени в URL-слаг (как в других функциях).
*   `SitemapEntry` — `url/lastmod/changefreq/priority`.
*   `onRequestGet()`:
    *   Статические записи: `/` (priority 1, daily), `/items` (0.9, weekly), `/profile` (0.8, monthly).
    *   Фетчит предметы; на каждый добавляет URL `/(en/)item/{slug}` (детали см. в коде) с приоритетом/частотой.
    *   Отдаёт XML (`application/xml`).

## AI-контекст
*   `BASE_URL` захардкожен на прод. Слаг-логика дублируется в нескольких функциях — синхронизируйте при изменениях.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
