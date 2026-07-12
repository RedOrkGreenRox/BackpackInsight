# [middleware/flatbuffer-decoders.ts](/Frontend/Web/ground/middleware/flatbuffer-decoders.ts)

## Назначение
Frontend-зеркало backend `middleware` crate: декодеры FlatBuffer-паков (`BIAI`, `BIPR`, `BIER`) в TypeScript-объекты `ItemDefinition` / `PlayerProfile` / `ApiError`.

## Ключевая функциональность
- Использует сгенерированные bindings из `./generated/backpack-insight/*` (TS FlatBuffer-код из `flatc --ts`).
- Возвращает типы из [api-types.ts](../types/api-types.md).
- `JsonLike` recursive type для значений полей предметов.

## Связи
- Backend-паритет: [RBackend/middleware](../../../RBackend/crates/middleware.md).
- Generated bindings: `./generated/` (плоский вывод `flatc`).
- Типы: [api-types.ts](../types/api-types.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
