# [Ветка каталога предметов (mod.rs)](/Backend/crates/branches/src/branches/items/mod.rs)

## Назначение
Ветка каталога предметов `/items`. Модуль собирается и для сервера, и для WASM; только сама страница `ItemsBranch` закрыта фичей `ssr`. Аналог [ItemsBranch.ts](/docs/Frontend/ground/branches/items/ItemsBranch.md) с его `_items/`.

## Ключевая функциональность
| Подмодуль | Видимость | Сборка | Что внутри |
| :--- | :--- | :--- | :--- |
| [branch.rs](branch.md) | приватный, реэкспорт `ItemsBranch` | `ssr` | страница: заголовок и первая порция карточек |
| [manager.rs](manager.md) | `pub` | обе | остров `ItemsManager`: заголовок, поиск по мере ввода, подгрузка при прокрутке |
| [search_fn.rs](search_fn.md) | `pub` | обе | серверная функция `search_items` (`GET /_fn/items`) |
| [card.rs](card.md) | `pub` | обе | `ItemCardView` — карточка, общая для SSR и острова |
| [url.rs](url.md) | `pub` | обе | ссылки каталога `/items?q=…&page=…` |
| [scroll.rs](scroll.md) | приватный | обе | `near_bottom` — «докрутили почти до конца» |

Разделение повторяет правило [REQUIREMENTS.md](/REQUIREMENTS.md) §3–4: страница (рендер) отдельно от менеджера (состояние и события), сервис поиска — в [catalog/search.rs](../../catalog/search.md), URL — отдельный модуль.

## Поток данных
1. Сервер: `ItemsBranch::render` вызывает `search_upto` и рендерит остров с готовыми карточками в HTML.
2. Браузер без JavaScript: форма поиска — обычный GET-запрос к `/items?q=…`; `?page=N` в адресе отдаёт сразу порции 0…N.
3. Браузер с WASM: `ItemsManager` оживает, при вводе вызывает `search_items` и обновляет сетку на месте, у нижнего края страницы догружает следующую порцию.

## Связи
- Список веток: [branches/mod.rs](../mod.md). Стили: перенесённые [items.scss](../../../style/branches/items/items.md) и карточки из [_roots/items](../../../style/roots/_roots/items/_items.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
