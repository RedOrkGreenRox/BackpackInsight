# [canvas/magnetic.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/magnetic.ts)

## Назначение
`MagneticEngine` — расчёт трансформации карточки: притяжение к курсору (в радиусе) + pseudo-3D наклон (`rotateX`/`rotateY` с perspective). Пишет только `transform` (GPU-friendly).

## Ключевая функциональность
- `updateCard(card, pointer, flags)` → `boolean` — пересчитывает центр карточки, применяет трансформацию, возвращает флаг изменения.
- Радиус-ограниченный эффект: карточки вне радиуса сбрасываются в `transform: none` один раз (`dirty` флаг).

## Связи
- Типы: [types.ts](types.md).
- Используется: [ItemsCanvasController](ItemsCanvasController.md).
- Управляется: [SettingsService](../../../../../utils/SettingsService.md) → `magnetic.enabled`/`strength`/`radius`.

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
