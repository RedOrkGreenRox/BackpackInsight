# [branches/branches/editor/ui/state.rs](/RBackend/crates/branches/src/branches/editor/ui/state.rs)

## Назначение
`Editor` — сигналы острова, общие для всех частей через контекст; `Rect` — прямоугольник элемента на экране.

## Ключевая функциональность
- `Rect { left, top, width, height }`, `contains(point)`.
- `Editor`: `kit` (`Option<Arc<Kit>>`), `board`, `hero`, `drag`, `pointer`, `hover`, `cell_px` и ссылки на узлы `field`, `storage`, `catalog`.
- `new(hero)`, `get()` (из контекста), `kit_now()` (без подписки), `edit(change)` — меняет поле, если набор загружен.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
