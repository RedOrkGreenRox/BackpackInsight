# [branches/branches/editor/ui/toolbar.rs](/RBackend/crates/branches/src/branches/editor/ui/toolbar.rs)

## Назначение
`Toolbar(labels, dialog)` — панель над полем: выбор героя (герои набора, «любой»), режим сумок (`aria-pressed`), сброс, импорт и экспорт.

## Ключевая функциональность
- Режим сумок — `Board::set_bag_mode`, сброс — `Board::reset` ([model/board.rs](../model/board.md)).
- Импорт и экспорт открывают окно [exchange.rs](exchange.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
