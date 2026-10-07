# [branches/branches/editor/ui/piece.rs](/RBackend/crates/branches/src/branches/editor/ui/piece.rs)

## Назначение
Картинка предмета на поле, на складе, в каталоге и под пальцем. Картинка нарисована для `Up` и покрывает охват формы (ось `y` вверх, проверено на банане, кошке и сабле); блок снаружи занимает охват повёрнутой формы, картинка внутри стоит по центру и поворачивается CSS. Размеры — в `var(--cell)`.

## Ключевая функциональность
- `box_style(bounds)` — `left/top/width/height` блока в клетках, строки сверху.
- `size_style(width, height)`.
- `PieceArt(item, orient)` — `.ed-art` с `<picture>` (`avif`, запасной `webp`, 1x — клетка 60 px, 2x — 120 px), `draggable="false"`; без картинки — заглушка.
- Приватная `srcset`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
