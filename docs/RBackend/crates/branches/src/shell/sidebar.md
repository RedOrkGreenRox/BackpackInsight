# [branches/shell/sidebar.rs](/RBackend/crates/branches/src/shell/sidebar.rs)

## Назначение
Остров `SidebarManager`: кнопка меню, выезжающая боковая панель с навигацией и переключатель языка. Разметка, `id` и классы те же, что в TS-версии ([Shell.ts](/docs/Frontend/ground/roots/Shell.md)), поэтому без изменений работают перенесённые стили из `style/roots/_roots/shell`: [_sidebar.scss](../../style/roots/_roots/shell/sidebar/_sidebar.md), [_nav-tab.scss](../../style/roots/_roots/shell/sidebar/_nav-tab.md), [_lang-switcher.scss](../../style/roots/_roots/shell/sidebar/_lang-switcher.md), [_button-toggle.scss](../../style/roots/_roots/shell/navigation/_button-toggle.md).

## Ключевая функциональность
- **`NavTab { href, icon, label }`** — вкладка: адрес, иконка внутри `/images` без формата и расширения (`templates/main` → `/images/templates/{avif,webp}/main.*`), подпись на языке страницы.
- **`SidebarLabels { menu, home, switch_lang }`** — подписи кнопки меню, логотипа и переключателя языка («Switch to RU»).
- **`SidebarManager(target, labels, tabs)`** — `target` — язык, на который ведёт переключатель. Разметка:
  - `.controls-wrapper > button.menu-toggle#menuToggle` с `aria-label`, `aria-controls="sidebar"` и `aria-expanded`, иконка `/images/const/*/menu.*`;
  - `nav.sidebar#sidebar` (класс `open`, пока панель открыта; `aria-label` — подпись главной):
    - `.sidebar-header > a.button-logo` — ссылка на `/` с логотипом;
    - `.nav-tabs` — по `a.nav-tab` на вкладку: `<picture>` (AVIF + WebP, `loading="lazy"`) и `span.page-title`;
    - `a#lang-switcher` с `href="?lang=xx"` и `hreflang`;
  - `.sidebar-overlay#sidebarOverlay` — затемнение, клик по нему закрывает панель.
- **Поведение:**
  - сигнал `open` переключает кнопка меню; клик по вкладке, логотипу или затемнению закрывает панель;
  - `Escape` закрывает панель (`window_event_listener`, обработчик снимается в `on_cleanup`);
  - `Effect` синхронизирует класс `sidebar-open` на `<body>`: он прячет кнопку меню и показывает затемнение.
- **`icon_paths(icon)`** (приватная) — пара путей AVIF/WebP; без папки берётся `const`.
- **`set_body_open(open)`** (приватная, работает только в `hydrate`) — `classList.toggle("sidebar-open", open)`.
- **`retarget_to_current_page(ev, target)`** (приватная, только `hydrate`) — перед переходом переписывает `href` переключателя на текущий адрес с новым `lang`. Остров не перерисовывается при навигации, поэтому его серверный `href` не знает, на какой странице сейчас пользователь.

## Смена языка
Переход по `?lang=xx` перехватывает islands router. Сервер запоминает язык в cookie ([ctx.rs](../roots/ctx.md)) и рендерит страницу заново. Остров обёрнут в `per_lang` ([per_lang.rs](../roots/per_lang.md)), поэтому router заменяет его целиком с новыми подписями.

## Связи
- Подписи и вкладки собирает сервер: [roots/chrome.rs](../roots/chrome.md).
- Реэкспорт: [shell/mod.rs](mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
