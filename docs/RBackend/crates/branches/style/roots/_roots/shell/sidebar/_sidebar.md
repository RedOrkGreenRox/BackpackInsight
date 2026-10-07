# [Боковое меню (_sidebar.scss)](/RBackend/crates/branches/style/roots/_roots/shell/sidebar/_sidebar.scss)

## Назначение
Боковое меню справа и затемнение под ним. Перенесено из TS-версии ([оригинал](/docs/Frontend/ground/roots/_roots/shell/sidebar/_sidebar.md)) и переведено на токены [_tokens.scss](../../_tokens.md). Фон стал плотнее: раньше панель была прозрачна на 80%, и на телефоне пункты не читались поверх карточек.

## Содержимое
- **`.sidebar`** — панель на всю высоту экрана (`100dvh`), ширина по содержимому в пределах `clamp(15rem, 22vw, 22rem)`…80vw (на узких экранах шире). Фон `--surface-panel` с размытием `--blur-glass`, граница слева `--line-subtle`. Спрятана за правым краем (`translateX(100%)`), **`.sidebar.open`** выдвигает её за `--dur-slow`.
- **`.sidebar-header`** — шапка с логотипом и линией снизу.
- **Фокус в закрытом меню** — «капля» из края экрана, стили в [_nav-drop.scss](_nav-drop.md). Логотип не выделяется вовсе: он вне обхода по Tab ([chrome.rs](../../../../../src/roots/chrome.md)).
- **`.sidebar-overlay`** — затемнение `--overlay` под открытым меню, появляется при **`body.sidebar-open`**; клик по нему закрывает меню ([shell/sidebar.rs](../../../../../src/shell/sidebar.md)).
- **`.low-res-mode`** — без размытия в режиме экономии.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
