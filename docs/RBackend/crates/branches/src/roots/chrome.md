# [Обвязка страницы (chrome.rs)](/RBackend/crates/branches/src/roots/chrome.rs)

## Назначение
Обвязка страницы вокруг ветки: боковая панель с навигацией. Сервер переводит все подписи на язык запроса и передаёт их острову `SidebarManager`, поэтому в WASM нет словарей.

## Ключевая функциональность
- **`NAV`** (приватная константа) — вкладки навигации в порядке показа: адрес, иконка внутри `/images` и ключ перевода.

  | Адрес | Иконка | Ключ |
  | :--- | :--- | :--- |
  | `/` | `templates/main` | `sidebar_main` |
  | `/items` | `templates/recipes` | `sidebar_items` |
  | `/editor` | `fonticon/typebag` | `sidebar_editor` |

  Новая страница в меню добавляется одной строкой.
- **`sidebar(ctx)`** — боковая панель на языке страницы:
  - `target` — второй язык (`Lang::other`, [model.rs](../model.md)), на него ведёт переключатель;
  - `SidebarLabels`: `menu` (`sidebar_menu`, подпись кнопки меню для экранных читалок), `home` (`sidebar_main`, подпись логотипа), `switch_lang` (`lang_switch_button` с подстановкой `{{lang}}` = код второго языка заглавными);
  - `NavTab` на каждую строку `NAV` с переведённой подписью;
  - результат оборачивается в `per_lang` ([per_lang.rs](per_lang.md)): при смене языка islands router заменяет остров целиком, а не оставляет старые подписи.

## Связи
- Вызывается из `App` ([shell.rs](shell.md)).
- Остров и типы подписей: [shell/sidebar.rs](../shell/sidebar.md).
- Переводы: [i18n.rs](i18n.md), словари `Frontend/Web/static/lang/{en,ru}.json`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
