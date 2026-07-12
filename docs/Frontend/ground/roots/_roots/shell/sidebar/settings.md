# [sidebar/settings.ts](/Frontend/Web/ground/roots/_roots/shell/sidebar/settings.ts)

## Назначение
`SettingsPanel` — кнопка ⚙ (absolute-positioned в сайдбаре рядом с lang-switcher) + slide-in панель с toggle/slider/select контролами для всех настроек + 3 preset-кнопки. Подписывается на [SettingsService](../../../../utils/SettingsService.md), защищает refresh от активного drag.

## Ключевая функциональность
- `SettingsPanel` класс — владеет button + panel DOM.
- Controls: magnetic.enabled/strength/radius, tilt, zoom, parallax, graphics, easing.
- Presets: `full`/`light`/`off` (применяют группу настроек одним кликом).
- Бинд к `SettingsService` через `subscribe()`.

## Связи
- Сервис: [SettingsService](../../../../utils/SettingsService.md).
- Стили: [_settings.scss](_settings.md).
- Хост: [Shell.ts](../../../Shell.md) (через `addSettingsPanel()`).

---
> 📌 **Подпись документации:** FE-1 настройки · 2026-07-12.
