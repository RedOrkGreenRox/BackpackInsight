# [Обвязка страницы (chrome.rs)](/RBackend/crates/branches/src/roots/chrome.rs)

## Назначение
Разметка меню вокруг ветки: кнопка меню, боковая панель и затемнение. Её рисует сервер на языке страницы, а не остров. Поэтому при каждом переходе islands router обновляет её вместе со страницей: подсвечивается пункт открытой страницы, подписи меняются при смене языка, панель закрывается. Оживляет разметку ленивый остров `SidebarManager` ([shell/sidebar.rs](../shell/sidebar.md)); в WASM нет ни словарей, ни разметки меню.

## Ключевая функциональность
- **`NAV`** (приватная константа) — пункты меню в порядке показа: адрес, иконка внутри `/images` и ключ перевода.

  | Адрес | Иконка | Ключ |
  | :--- | :--- | :--- |
  | `/` | `templates/main` | `sidebar_main` |
  | `/items` | `templates/recipes` | `sidebar_items` |
  | `/editor` | `fonticon/typebag` | `sidebar_editor` |

  Новая страница в меню добавляется одной строкой.
- **`sidebar(ctx)`** — разметка, `id` и классы те же, что в TS-версии ([Shell.ts](/docs/Frontend/ground/roots/Shell.md)):
  - `.controls-wrapper > button.menu-toggle#menuToggle` с `aria-label` (`sidebar_menu`), `aria-controls="sidebar"`, `aria-expanded="false"`;
  - `nav.sidebar#sidebar` (`aria-label` — `sidebar_main`): `.sidebar-header > a.button-logo` на `/`, `.nav-tabs` с пунктами, `a.nav-tab#lang-switcher` с `href="?lang=xx"`, `hreflang` и подписью `lang_switch_button` («Сменить язык на EN» / «Switch to RU»);
  - `.sidebar-overlay#sidebarOverlay` — затемнение.
- **`nav_tab(href, icon, label, current)`** — пункт: `<picture>` (AVIF + WebP, `loading="lazy"`) и `span.page-title`. У пункта открытой страницы класс `active` и `aria-current="page"`, у остальных `aria-current="false"`: router при переходе только переписывает атрибуты и не удалил бы устаревший.
- **`is_current(path, href)`** — `/` совпадает только с главной, остальные пункты — со своим разделом (`/items` и `/items/...`).
- **`icon_paths(icon)`** — пара путей AVIF/WebP; без папки берётся `const`.

## Связи
- Вызывается из `App` ([shell.rs](shell.md)).
- Переводы: [i18n.rs](i18n.md), словари `Frontend/Web/static/lang/{en,ru}.json`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
