# [Параллакс фона (parallax.rs)](/Backend/crates/branches/src/shell/parallax.rs)

## Назначение
Остров `ParallaxManager`: фон чуть смещается за курсором. Перенос [Parallax.ts](/docs/Frontend/ground/roots/Parallax.md) с теми же константами. Остров ничего не рисует, он только вешает обработчик на окно и двигает `#bgImg` из [roots/shell.rs](../roots/shell.md).

## Ключевая функциональность
- **`INTENSITY`** = 1.5 — сила смещения, как в TS-версии.
- **`THROTTLE_MS`** = 20 — пересчёт не чаще раза в 20 мс (по `event.timeStamp`).
- **`ParallaxManager()`**:
  - `window_event_listener(mousemove)`; первое движение запоминает точку отсчёта, следующие сдвигают фон относительно неё;
  - обработчик снимается в `on_cleanup`. Islands router не трогает острова при переходах, поэтому на деле обработчик живёт, пока открыт сайт.
- **`shift_background(start, point)`** (приватная, работает только в `hydrate`) — смещение в процентах от размера окна: `-(Δ / размер) × 100 × INTENSITY / 50`. Пишет `transform: translate(-50%, -50%) translate(x%, y%) scale(1.1)`; `scale(1.1)` прячет края картинки при сдвиге.

## Связи
- Реэкспорт: [shell/mod.rs](mod.md); вызывается из `App` в [roots/shell.rs](../roots/shell.md).
- Стили фона: [_background.scss](../../style/roots/_roots/shell/parallax/_background.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
