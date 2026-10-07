# [Поворот предмета (orientation.rs)](/RBackend/crates/branches/src/branches/editor/model/orientation.rs)

## Назначение
`Orientation` — поворот предмета (`Up`, `Right`, `Down`, `Left`), как поле `orientation` в экспорте игры. Сверено с экспортом билда Mycella: `Left` переводит смещение `(x, y)` в `(-y, x)` (четверть оборота против часовой), `Right` — в `(y, -x)`.

## Ключевая функциональность
- `turns` / `from_turns` — число четвертей по часовой от `Up`.
- `clockwise` — следующий поворот; `then(other)` — сумма поворотов; `since(from)` — поворот, переводящий `from` в `self`.
- `apply(cell)` — поворачивает смещение клетки формы.
- `name` / `parse` — имя в файле игры (без учёта регистра).

## Связи
- Используется в [cell.rs](cell.md), [placed.rs](placed.md), [url.rs](url.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
