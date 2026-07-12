# [sidebar/_settings.scss](/Frontend/Web/ground/roots/_roots/shell/sidebar/_settings.scss)

## Назначение
Стили кнопки ⚙ + slide-in панели настроек. Импортируется из `_shell.scss` через `@use "shell/sidebar/settings"`.

## Ключевая функциональность
- `#settings-toggle` — absolute-позиционированная кнопка (clamp-размер, сидит рядом с lang-switcher).
- Slide-in анимация панели (transform + opacity).
- Settings rows (label + control) + presets.
- `prefers-reduced-motion` и `body.low-res-mode` guards.

## Связи
- Логика: [settings.ts](settings.md).
- Хост-стили: `_sidebar.scss` (см. [_sidebar.md](_sidebar.md)).

---
> 📌 **Подпись документации:** FE-1 настройки · 2026-07-12.
