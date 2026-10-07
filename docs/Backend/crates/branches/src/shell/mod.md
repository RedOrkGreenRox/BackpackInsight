# [Острова общего каркаса (mod.rs)](/Backend/crates/branches/src/shell/mod.rs)

## Назначение
Острова общего каркаса сайта (меню и параллакс фона), а в браузере ещё плавный уход со страницы и докачка WASM ленивых островов. В отличие от [roots](../roots/mod.md), модуль компилируется в обе сборки (`ssr` и `hydrate`): сервер рендерит острова в HTML, WASM их оживляет. Остальной каркас (документ, фон, разметка меню, выбор ветки) рисует сервер в [roots/shell.rs](../roots/shell.md) и [roots/chrome.rs](../roots/chrome.md).

## Ключевая функциональность
Модуль только объявляет подмодули и реэкспортирует их публичные имена:

| Имя | Откуда | Роль |
| :--- | :--- | :--- |
| `SidebarManager` | [sidebar.rs](sidebar.md) | ленивый остров: кнопка меню, затемнение, `Escape`, ссылка языка |
| `ParallaxManager` | [parallax.rs](parallax.md) | смещение фона за курсором |
| `fade_on_leave` | [fade.rs](fade.md) | только `hydrate`: `#app` расплывается сразу по клику на ссылку другой страницы |
| (внутр.) `drop_wave` | [drop_wave.rs](drop_wave.md) | только `hydrate`: волна по соседям «капли» закрытого меню |
| (внутр.) `lang_stay` | [lang_stay.rs](lang_stay.md) | только `hydrate`: смена языка не закрывает меню и не сбрасывает фокус |
| `prefetch_lazy_islands` | [prefetch.rs](prefetch.md) | только `hydrate`: докачка WASM ленивых островов в простое |

Имена с суффиксом «Manager» (`ItemsManager`) повторяют дендритную схему TS-версии, где интерактивные части страницы — менеджеры.

## Связи
- Подключается в [lib.rs](../lib.md); `fade`, `prefetch`, `drop_wave` и `lang_stay` — только с фичей `hydrate`; два последних вызывает [sidebar.rs](sidebar.md).
- Использование: `App` в [roots/shell.rs](../roots/shell.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
