# [Меню сайта (sidebar.rs)](/RBackend/crates/branches/src/shell/sidebar.rs)

## Назначение
Ленивый остров `SidebarManager` (`#[island(lazy)]`) оживляет меню, которое нарисовал сервер ([roots/chrome.rs](../roots/chrome.md)). Сам остров ничего не рисует: он вешает обработчики на документ и переключает классы. Код острова собирается в отдельный WASM-файл (`cargo leptos build --split`), основной WASM от него не растёт; файл грузится параллельно с основным по `preload` из [lazy.rs](../roots/lazy.md).

## Ключевая функциональность
- **`SidebarManager()`** — без пропсов. На сервере ничего не делает, в браузере (фича `hydrate`) вызывает `dom::attach`.
- **`dom::attach`** (приватная, только `hydrate`) — один раз вешает:
  - обработчик `click` на **документ** (не на окно): клик доходит сюда раньше, чем до islands router, который слушает окно;
  - обработчик `keydown` на окно: `Escape` закрывает открытое меню и возвращает фокус на кнопку `#menuToggle`.
  Острова не пересоздаются при переходах, поэтому обработчики живут, пока открыт сайт.
- **`on_click`** — по `closest()` от цели клика:
  - `#menuToggle` — открыть или закрыть меню;
  - `#sidebarOverlay` — закрыть;
  - `#lang-switcher` — `retarget_to_current_page`;
  - любая другая ссылка в `#sidebar` — закрыть меню сразу, не дожидаясь новой страницы.
- **`set_open(open)`** — класс `open` у `#sidebar` (панель выезжает), `sidebar-open` у `<body>` (кнопка прячется, появляется затемнение), `aria-expanded` у кнопки. При открытии фокус переходит на первый пункт меню.
- **`is_open`**, **`focus_by_id`** — мелкие помощники.
- **`retarget_to_current_page(link)`** — перед переходом ставит в ссылку языка текущий адрес с `lang` из её `hreflang`. Сервер знает только адрес, с которым пришла страница, а поиск в каталоге меняет адрес на месте.

## Состояние в разметке
Открыто ли меню, хранится в классах, а не в сигнале. При любом переходе islands router переписывает атрибуты серверными (`class="sidebar"`, `aria-expanded="false"`, `class` у `<body>`), и меню закрывается само.

## Связи
- Разметка меню и пункты: [roots/chrome.rs](../roots/chrome.md). Остров ставит `App` ([roots/shell.rs](../roots/shell.md)).
- Стили: [_button-toggle.scss](../../style/roots/_roots/shell/navigation/_button-toggle.md), [_sidebar.scss](../../style/roots/_roots/shell/sidebar/_sidebar.md), [_nav-tab.scss](../../style/roots/_roots/shell/sidebar/_nav-tab.md), [_lang-switcher.scss](../../style/roots/_roots/shell/sidebar/_lang-switcher.md).
- Реэкспорт: [shell/mod.rs](mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
