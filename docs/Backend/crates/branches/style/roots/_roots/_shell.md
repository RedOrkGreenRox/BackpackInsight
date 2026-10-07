# [Стили каркаса (_shell.scss)](/Backend/crates/branches/style/roots/_roots/_shell.scss)

## Назначение
Агрегатор стилей оболочки приложения (Shell). Собственных правил не содержит — только подключает через `@use` партиалы из папки `shell/` в нужном порядке.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/roots/_roots/_shell.scss](/docs/Frontend/ground/roots/_roots/_shell.md).
Общие стили каркаса: подключаются в [site.scss](../../site.md) глобально.

## Содержимое
- Подключает: [`shell/navigation/controls-wrapper`](shell/navigation/_controls-wrapper.md), [`shell/sidebar/button-logo`](shell/sidebar/_button-logo.md), [`shell/navigation/button-toggle`](shell/navigation/_button-toggle.md), [`shell/sidebar/sidebar`](shell/sidebar/_sidebar.md), [`shell/sidebar/nav-tab`](shell/sidebar/_nav-tab.md), [`shell/sidebar/nav-drop`](shell/sidebar/_nav-drop.md) (капля закрытого меню, только в Leptos-версии), [`shell/parallax/background`](shell/parallax/_background.md), [`shell/sidebar/page-title`](shell/sidebar/_page-title.md), [`shell/sidebar/lang-switcher`](shell/sidebar/_lang-switcher.md), [`shell/navigation/page-transitions`](shell/navigation/_page-transitions.md) (переходы между страницами, только в Leptos-версии).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
