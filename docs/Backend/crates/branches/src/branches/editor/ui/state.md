# [Состояние редактора (state.rs)](/Backend/crates/branches/src/branches/editor/ui/state.rs)

## Назначение
`Editor` — сигналы острова, общие для всех частей через контекст; `Rect` — прямоугольник элемента на экране; `StashMode` — вид склада; `Spawn` — где отпустили предмет над складом.

## Ключевая функциональность
- `Rect { left, top, width, height }`, `contains(point)`.
- `StashMode::Gravity` (по умолчанию) и `StashMode::List`.
- `Editor`: `kit` (`Option<Arc<Kit>>`), `board`, `hero`, `drag`, `pointer`, `hover`, `cell_px`, `stash`, `pile` (тела склада с гравитацией), `spawn` (подсказка для [pile.rs](pile.md)), `field_cell` и `catalog_height` (размеры из ручек [grip.rs](grip.md), `None` — по экрану) и ссылки на узлы `field`, `storage`, `catalog`.
- `new(hero)`, `get()` (из контекста), `kit_now()` (без подписки), `edit(change)` — меняет поле, если набор загружен.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
