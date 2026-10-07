# [Панель кнопок редактора (toolbar.rs)](/RBackend/crates/branches/src/branches/editor/ui/toolbar.rs)

## Назначение
`Toolbar(labels, dialog)` — панель над полем: портрет героя ([hero.rs](hero.md)), иконки из игры — сброс, режим сумок, вид склада — и текстовые кнопки импорта и экспорта.

## Ключевая функциональность
- `IconButton(name, label, pressed, on_press)` (приватный) — кнопка-картинка `icon(name)` = `/images/editor/icons/<name>.webp`; подпись — в `title` и `aria-label`, `pressed` даёт `aria-pressed` и класс `ed-on`.
- Сброс — `Board::reset`, режим сумок — `Board::set_bag_mode` ([model/board.rs](../model/board.md)).
- Вид склада переключает `Editor::stash` между `StashMode::Gravity` и `StashMode::List`; иконка и подпись показывают, каким склад станет по нажатию (`stash-list` / `stash-gravity`).
- Импорт и экспорт открывают окно [exchange.rs](exchange.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
