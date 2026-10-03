# [branches/branches/items/manager.rs](/RBackend/crates/branches/src/branches/items/manager.rs)

## Назначение
`ItemsManager` — остров каталога (`#[island(lazy)]`): заголовок, поле поиска, сетка карточек и подгрузка при прокрутке. Сервер рендерит его в HTML с первой порцией; в браузере WASM оживляет только этот фрагмент. Rust-замена TS-монолита [ItemsManager.ts](/docs/Frontend/ground/branches/items/_items/managers/ItemsManager.md) в объёме простого поиска. Разметка и классы — как у TS-версии (`wiki-header`, `search-container`, `items-grid`), поэтому работают перенесённые стили.

Остров ленивый: при сборке с `--split` его код лежит в отдельном WASM-файле, который главная и другие страницы без каталога не грузят сразу, а докачивают в простое ([roots/lazy.rs](../../roots/lazy.md), [shell/prefetch.rs](../../shell/prefetch.md)). На странице каталога файл качается параллельно с основным WASM.

Без JavaScript остров — обычная форма (`/items?q=…`). С WASM он ищет на лету, обновляет адресную строку без перезагрузки и догружает карточки у нижнего края страницы.

## Ключевая функциональность
- **`ItemsManager(lang, query, initial, labels)`** — пропсы приходят с сервера ([branch.rs](branch.md)). Состояние:
  - `RwSignal`: `text` (строка поиска), `cards`, `total`, `page`, `has_more` — из `initial: ItemsPage`; `loading` — идёт ли запрос;
  - `StoredValue`: `last_request` (номер последнего запроса) и `timer` (`TimeoutHandle` отложенного поиска).
- **`fetch(query, next)`** (замыкание) — увеличивает `last_request`, ставит `loading` и вызывает `search_items` через `spawn_local`. Ответ на устаревший запрос (номер не совпал) отбрасывается, ошибка только снимает `loading`. `next == 0` заменяет карточки, иначе дописывает в конец; затем обновляет `total`, `page`, `has_more`.
- **`on_input`** — запоминает текст, сбрасывает прежний таймер и через `DEBOUNCE` (200 мс, `set_timeout_with_handle`) делает `replace_url(items_href(value, 0))` и `fetch(value, 0)`.
- **`on_submit`** — `prevent_default` и немедленный `fetch` первой порции (Enter без ожидания паузы).
- **Бесконечная прокрутка**, как в TS-версии: `window_event_listener(scroll)` грузит порцию `page + 1`, если `has_more`, нет `loading` и `near_bottom()` ([scroll.rs](scroll.md)). Обработчик снимается в `on_cleanup`. Адресная строка при подгрузке не меняется.
- **Разметка:**
  - `.wiki-header`: `h1.main-title` (`data-aos="fade-down"`), `p.wiki-subtitle`, форма `search-container` (`role="search"`, `action="/items"`, `method="get"`) с полем `input#itemSearch.search-input-rich` (`type="search"`, `name="q"`, подпись из `labels.placeholder`);
  - `p.sr-only` с `aria-live="polite"` — счётчик для экранного диктора (`{0}` в `labels.found` заменяется на `total`);
  - `.items-grid#wikiItemsGrid` через `For` с ключом `slug` — `ItemCardView` с номером в выдаче и `eager` для первых `EAGER_IMAGES`;
  - `p.items-empty` при `total == 0`;
  - `.items-scroll-sentinel#itemsScrollSentinel` (`aria-hidden`) — маркер конца списка из TS-версии; подгрузку запускает обработчик прокрутки.
- **`replace_url(url)`** (приватная) — `history.replaceState` через `web-sys`, только под `#[cfg(feature = "hydrate")]`; на сервере ничего не делает. Нужна, чтобы ссылкой на поиск можно было поделиться.

`data-aos` — атрибуты анимаций появления из TS-версии; их заменяют keyframes в [_leptos.scss](../../../style/_leptos.md).

## Связи
- Серверная функция: [search_fn.rs](search_fn.md). Карточка: [card.rs](card.md). Ссылки: [url.rs](url.md).
- Типы пропсов: [model.rs](../../model.md). Стили: [items.scss](../../../style/branches/items/items.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-03.
