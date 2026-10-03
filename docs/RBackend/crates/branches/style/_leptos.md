# [branches/style/_leptos.scss](/RBackend/crates/branches/style/_leptos.scss)

## Назначение
Дополнения к перенесённым стилям TS-версии, нужные разметке Leptos. Всё, что не помещается в «перенесено без изменений», собрано здесь, чтобы старые файлы оставались копией оригинала.

## Ключевая функциональность
- **Базовые стили страницы** из инлайн-стилей старого `index.html`: `body` без отступов, фон `#121212`, белый текст; `#app` — блок высотой не меньше экрана поверх фона (`z-index: 1`).
- **`leptos-island { display: contents }`** — обёртка острова не влияет на раскладку, поэтому сетки и флексы работают как в TS-версии.
- **Ссылки вместо кнопок.** В TS-версии вкладки, логотип, переключатель языка и кнопка 404 были `<button>`/`<div data-link>`; здесь это настоящие `<a>` (работают без JavaScript и через islands router). `.nav-tab`, `.button-logo`, `#lang-switcher`, `.btn-404` наследуют цвет и без подчёркивания; `#lang-switcher` — `inline-block` по центру.
- **Поле поиска** `.search-input-rich` (`type="search"`): без системного оформления и крестика очистки, которых в старом поле не было; `.search-container` — блок.
- **`.items-empty`** — текст «ничего не найдено» по центру, белый с прозрачностью 0,7.
- **`.sr-only`** — текст только для экранного диктора (счётчик найденных предметов).
- **Замена библиотеки AOS:** keyframes `aosFadeDown` и `aosFadeUp` (сдвиг на 30px и прозрачность) для `[data-aos="fade-down"]` и `[data-aos="fade-up"]`, 0,8 с.
- **Волна карточек:** `.item-card-link` проигрывает `fadeUp` из [_fade-up.scss](branches/items/_items/animations/_fade-up.md) с задержкой `var(--fade-delay)`, которую ставит [items/card.rs](../src/branches/items/card.md).
- **Переходы islands router:**
  - `.background-image` получает `view-transition-name: site-background`, а `::view-transition-group(site-background)` без анимации: фон стоит на месте;
  - `::view-transition-old(root)` уходит с размытием 6px за 0,16 с (`viewBlurOut`), `::view-transition-new(root)` проявляется из размытия за 0,22 с (`viewBlurIn`). При смене языка текст на мгновение размывается и проявляется уже переведённым.
- **`prefers-reduced-motion: reduce`** отключает все эти анимации.

## Связи
- Подключается в [site.scss](site.md) после перенесённых стилей.
- Переходы запускает islands router, включённый в [roots/shell.rs](../src/roots/shell.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
