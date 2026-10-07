# [Одна картинка предмета (item.rs)](/Backend/crates/art/src/item.rs)

## Назначение
Одна картинка предмета: слои → мастер-холст → все размеры клетки и все состояния → запись манифеста.

## API
- **`render_item(item, source, input)`** — `shape_cells` по форме, slug из `id` (`SlugService`), `render::render` слоёв, `encode::write_sizes`; каждое состояние рисуется тем же поворотом и подгонкой и пишется как `<slug>--<состояние>`. Возвращает `(id, ItemArt, Fit)`; `source` в манифесте — пути слоёв относительно корня архива.

## Связи
- [render.rs](render.md), [encode.rs](encode.md), [manifest.rs](manifest.md), [resolve.rs](resolve.md); вызывающий — [build.rs](build.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
