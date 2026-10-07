# [Сведение слоёв картинки (render.rs)](/Backend/crates/art/src/render.rs)

## Назначение
Сведение слоёв в один холст «рамка формы × клетка». Мастер-холст — `MASTER_CELL = 120` px на клетку, как в ContentKit с версии 1.0.

## API
- **`shape_cells(shape)`** — ширина и высота рамки формы (`item_shape`) в клетках (пустая форма — 1×1).
- **`Fit`** — `Exact`, `Stretched { from }`, `Letterboxed { from }`.
- **`render(layers, cells, rotate, default_rotate, tolerance)`**:
  1. `compose` — слои по центру самого большого, снизу вверх;
  2. поворот: явный из правил, иначе `default_rotate`, если картинка лежит поперёк формы (`crosswise`: без поворота пропорции не сходятся, с поворотом сходятся; для квадратной формы не срабатывает);
  3. точное совпадение — `Exact`; разница пропорций `aspect_gap` ≤ допуска — растяжение Lanczos3 (`Stretched`: рамки сумок 255×375, сдвиги на пару px); иначе `letterbox` — вписать по центру с прозрачными полями.
- **`scale(master, cell)`** — мастер-холст к другому размеру клетки.

## Тесты
В [render_tests.rs](render_tests.md).

## Связи
- Вызывающие: [item.rs](item.md), [encode.rs](encode.md) (`scale`).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
