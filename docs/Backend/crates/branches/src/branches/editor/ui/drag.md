# [Перетаскиваемый предмет (drag.rs)](/Backend/crates/branches/src/branches/editor/ui/drag.rs)

## Назначение
`Drag` — перетаскиваемый предмет и расчёт клетки, куда он встанет. Нажатие запоминает `Origin`; предмет снимается (`Lifted`) только после сдвига на `THRESHOLD` = 5 px, поэтому простой клик ничего не меняет.

## Ключевая функциональность
- `Origin`: `Catalog`, `Storage(i)`, `Item(i)`, `Bag(i)`. `Lifted`: `Catalog`, `Storage`, `Item(Placed)`, `Bag(Placed, Vec<Placed>)`.
- `Drag { piece, orient, grab, pointer_id, start, origin, lifted }`; `grab` — точка захвата в долях охвата.
- `bounds(kit)`; `rotate()` — по часовой, точка захвата поворачивается вместе с предметом; `corner(kit, pointer, cell)` — левый верхний угол охвата, px.
- `target(kit, pointer, field, cell)` — ближайшая клетка для левого верхнего угла охвата, пересчитанная в опорную клетку (`y` вверх); `None`, если указатель не над полем.
- `bounds(kit, piece, orient)` (свободная функция); приватная `to_cell`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
