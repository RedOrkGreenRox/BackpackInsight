# [Кнопка меню (_button-toggle.scss)](/Backend/crates/branches/style/roots/_roots/shell/navigation/_button-toggle.scss)

## Назначение
Кнопка открытия меню справа сверху. Перенесена из TS-версии ([оригинал](/docs/Frontend/ground/roots/_roots/shell/navigation/_button-toggle.md)) и переведена на токены [_tokens.scss](../../_tokens.md): раньше она была 100×100px и на телефоне закрывала карточки при прокрутке.

## Содержимое
- **`.menu-toggle`** — квадрат `--control-size`: не меньше зоны нажатия `--tap-min`, растёт с шириной экрана до 4.5rem. Стекло `--surface-1` с размытием `--blur-glass`, рамка `--line`, скругление `--radius-md`. При наведении фон `--surface-2` и рамка `--accent`.
- **`.menu-toggle picture`**, **`.toggle-icon`** — иконка занимает 70% кнопки и масштабируется вместе с ней; при наведении чуть увеличивается.
- **`body.sidebar-open .menu-toggle`** — меню открыто: кнопка не нажимается и отъезжает на `--space-lg` синхронно с панелью.
- **`.low-res-mode .menu-toggle`** — без размытия в режиме экономии.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
