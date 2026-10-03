# [branches/branches/items/search_fn.rs](/RBackend/crates/branches/src/branches/items/search_fn.rs)

## Назначение
Серверная функция поиска для острова `ItemsManager`. Макрос `#[server]` генерирует из одного объявления и серверный обработчик (сборка `ssr`), и клиентскую заглушку, которая делает HTTP-запрос (сборка `hydrate`). Тело функции компилируется только на сервере.

## Ключевая функциональность
- **`MAX_QUERY`** = 200 — максимальная длина запроса в символах. Применяется и здесь, и в `ItemsBranch` ([branch.rs](branch.md)), чтобы длинная строка не нагружала поиск.
- **`search_items(lang, q, page)`** → `Result<ItemsPage, ServerFnError>`:
  - адрес `GET /_fn/items?lang=…&q=…&page=…` (`prefix = "/_fn"`, `endpoint = "items"`, кодек `GetUrl`). GET, а не POST, чтобы ответы кэшировались браузером и Cloudflare;
  - берёт `CatalogHandle` из контекста (его кладёт `BranchRunner::router`, [roots/runner.rs](../../roots/runner.md));
  - ставит `Cache-Control: public, max-age=300` через `ResponseOptions`;
  - обрезает `q` до `MAX_QUERY` и возвращает **одну** порцию `search_page` ([catalog/search.rs](../../catalog/search.md)) на запрошенном языке.
- Функция объявлена `async` без `await`: так требует Leptos, отсюда `allow(clippy::unused_async)`.

## Связи
- Вызывающий: [manager.rs](manager.md). Маршрут `/_fn/{*fn_name}`: [roots/runner.rs](../../roots/runner.md).
- Тип ответа: `ItemsPage` в [model.rs](../../model.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
