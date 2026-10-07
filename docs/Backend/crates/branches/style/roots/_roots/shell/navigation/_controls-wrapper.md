# [Угол с кнопкой меню (_controls-wrapper.scss)](/Backend/crates/branches/style/roots/_roots/shell/navigation/_controls-wrapper.scss)

## Назначение
Фиксированный угол справа сверху, в котором стоит кнопка меню. Перенесён из TS-версии ([оригинал](/docs/Frontend/ground/roots/_roots/shell/navigation/_controls-wrapper.md)) и переведён на токены [_tokens.scss](../../_tokens.md).

## Содержимое
- **`.controls-wrapper`** — `position: fixed`, отступ `--space-sm` от края, но не меньше выреза экрана (`env(safe-area-inset-*)`). Сам не ловит клики (`pointer-events: none`), его дети ловят (**`.controls-wrapper > *`**).
- **`body.sidebar-open .controls-wrapper`**, **`body.leaving .controls-wrapper`** — плавно исчезает (`--dur-slow`), пока открыто меню.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
