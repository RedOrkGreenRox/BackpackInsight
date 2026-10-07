# [Корень всех стилей (_roots.scss)](/Backend/crates/branches/style/roots/_roots.scss)

## Назначение
Этот файл является центральным узлом всей стилизации приложения. Он собирает воедино все системные, базовые и компонентные стили ядра в единый CSS-бандл.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/roots/_roots.scss](/docs/Frontend/ground/roots/_roots.md).
Общие стили каркаса: подключаются в [site.scss](../site.md) глобально.

## Содержимое
- Подключает: [`_roots/vars`](_roots/_vars.md), [`_roots/tokens`](_roots/_tokens.md), [`_roots/reset`](_roots/_reset.md), [`_roots/fonts`](_roots/_fonts.md), [`_roots/error`](_roots/_error.md), [`_roots/interactivity`](_roots/_interactivity.md), [`_roots/animations`](_roots/_animations.md), [`_roots/shell`](_roots/_shell.md), [`_roots/items/items`](_roots/items/_items.md), [`_roots/low-res`](_roots/_low-res.md), [`../utils/_loading-states/loading-states`](../utils/_loading-states/loading-states.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
