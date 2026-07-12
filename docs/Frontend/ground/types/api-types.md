# [Типы API (api-types.ts)](/Frontend/Web/ground/types/api-types.ts)

## Назначение
Унифицированные TypeScript-типы, соответствующие backend FlatBuffer-схемам (`api_items.fbs`, `profile.fbs`, `error.fbs`). Полная type-safety для ingestion/декодирования.

## Ключевая функциональность
- `CombatStats { damageMin, damageMax, accuracy, staminaCost, ... }`.
- `ItemDefinition` — элемент каталога предметов.
- `PlayerProfile` — полный профиль игрока.
- `Hero`, `ItemStat`, `SkinList` — вспомогательные.

## Связи
- Backend-соответствие: [RBackend/schemas](../../../RBackend/schemas.md).
- Frontend-декодер: [flatbuffer-decoders.ts](../middleware/flatbuffer-decoders.md).
- Используется: [canvas/ItemsCanvasController](../branches/items/_items/managers/canvas/ItemsCanvasController.md), [canvas/zoom](../branches/items/_items/managers/canvas/zoom.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
