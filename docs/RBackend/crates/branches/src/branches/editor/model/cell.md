# [branches/branches/editor/model/cell.rs](/RBackend/crates/branches/src/branches/editor/model/cell.rs)

## Назначение
Клетки поля рюкзака. Координаты как в экспорте игры: `x` вправо, `y` вверх; поле `WIDTH` = 9 на `HEIGHT` = 6 клеток. На экране строка сверху = `HEIGHT - 1 - y`.

## Ключевая функциональность
- `Cell { x, y }` (`i16`, сериализуется как `{"x":…,"y":…}`, как в файле игры): `new`, `plus`, `minus`, `on_field`.
- `Bounds { min, max }` — охват клеток: `of(cells)` (`None` для пустого списка), `width`, `height`.
- `place(shape, pos, orient)` — клетки формы, повёрнутой на `orient` и поставленной опорной клеткой в `pos`.

## Связи
- Поворот: [orientation.rs](orientation.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
