# [XML-карта сайта (sitemap.rs)](/Backend/crates/api/src/seo/sitemap.rs)

## Назначение
`generate_sitemap(project_root, base_url)` — XML-карта сайта: три статические страницы и по одной записи на каждый предмет из английского пака.

## Состав
| URL | changefreq | priority |
| :--- | :--- | :--- |
| `<base>/` | daily | 1.0 |
| `<base>/items` | weekly | 0.9 |
| `<base>/profile` | monthly | 0.8 |
| `<base>/item/<slug>` для каждого предмета | monthly | 0.7 |

Предметы берутся из `Backend/generated/api_items_en.fb` через `decode_items` ([middleware/items](../../../middleware/src/items.md)); слаг строится из имени через `SlugService::to_slug` ([core/slug](../../../core/src/slug.md)).

Фронтенд открывает предмет по адресу `/items?item=<slug>` (параметр читает [ItemsBranch](../../../../../Frontend/ground/branches/items/ItemsBranch.md)), а путь `/item/` в [core](../../../../../Frontend/ground/core.md) не зарегистрирован: роутер показывает на нём страницу 404. Ссылки на предметы в карте сайта не совпадают с маршрутами фронтенда.

## Внутреннее
- `SitemapEntry` — `loc`, `changefreq`, `priority`.
- `render_sitemap(entries)` — собирает `urlset` по схеме sitemaps.org 0.9.
- `escape_xml(value)` — экранирует `&`, `<`, `>`, кавычки и апостроф в `loc`.

## Тесты
`generates_sitemap_from_repository_pack` — на реальном паке проверяет заголовок XML, `/items` и запись `/item/wooden-sword`. Если пака нет, тест молча проходит.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
