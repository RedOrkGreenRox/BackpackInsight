# [Серверная страница каталога (branch.rs)](/Backend/crates/branches/src/branches/items/branch.rs)

## Назначение
`ItemsBranch` — серверная страница каталога `/items`: остров `ItemsManager`, в который сразу переданы подписи и первая порция карточек. Пользователь видит заголовок, поиск и сетку в первом же HTML, без ожидания WASM. Аналог [ItemsBranch.ts](/docs/Frontend/ground/branches/items/ItemsBranch.md).

## Ключевая функциональность
- **`struct ItemsBranch`** + `impl Branch`:
  - `SPEC`: `name` `ItemsBranch`, `path` `/items`, `islands` `["ItemsManager"]`, `sitemap: true`;
  - `head(ctx)`: `PageHead::section` — «{items_title} | Backpack Insight», описание из `items_subtitle` ([roots/head.rs](../../roots/head.md));
  - `render(ctx)`:
    1. `q` из query, обрезанный до `MAX_QUERY` символов ([search_fn.rs](search_fn.md)) — те же правила, что у серверной функции;
    2. `page` из query (нечисловое значение → 0);
    3. `search_upto(ctx.catalog(), query, page)` — **все** карточки с первой порции по `page` включительно ([catalog/search.rs](../../catalog/search.md)). Ссылка с `?page=2` показывает то же, что пользователь видел после двух подгрузок;
    4. `ItemsLabels` из ключей `items_title`, `items_subtitle`, `items_search_placeholder`, `items_empty`, `items_found`;
    5. разметка: `section.wiki-section > .container` с островом `<ItemsManager lang query initial labels/>`.
- Остров обёрнут в `per_lang` ([roots/per_lang.rs](../../roots/per_lang.md)): при смене языка islands router заменяет его целиком, и заголовок, подписи и карточки приходят на новом языке. Без обёртки router оставил бы остров со старыми подписями.

Пропсы острова (`Lang`, строка запроса, `ItemsPage`, `ItemsLabels`) сериализуются в HTML, поэтому все они определены в [model.rs](../../model.md).

## Связи
- Остров: [manager.rs](manager.md). Контекст запроса: [roots/ctx.rs](../../roots/ctx.md).
- Модуль ветки: [items/mod.rs](mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-03.
