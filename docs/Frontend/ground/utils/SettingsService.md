# [utils/SettingsService.ts](/Frontend/Web/ground/utils/SettingsService.ts)

## Назначение
Singleton-сервис настроек приложения с localStorage-persistence и subscriber-pattern. Один глобальный store для всего сайта.

## Ключевая функциональность
- localStorage key: `backpackInsight.settings`.
- `AppSettings { magnetic, tilt, zoom, parallax, graphics, easing }`.
- `PartialDeep<T>` обновление через `update(partial)`.
- 3 preset: `full` / `light` / `off`.
- `subscribe(cb)` — подписка на изменения (используется [Parallax](../roots/Parallax.md), [SettingsPanel](../roots/_roots/shell/sidebar/settings.md)).
- Автоприменение `body.low-res-mode` когда `graphics='low'`.

## Связи
- Подписчики: [Parallax.ts](../roots/Parallax.md), [settings.ts (panel)](../roots/_roots/shell/sidebar/settings.md), [canvas/types.ts](../branches/items/_items/managers/canvas/types.md).

---
> 📌 **Подпись документации:** FE-1 глобальные настройки · 2026-07-12.
