# [Модель редактора (mod.rs)](/RBackend/crates/branches/src/branches/editor/model/mod.rs)

## Назначение
Модель редактора без браузера и сервера: всё здесь проверяется обычными `cargo test`. Подмодули публичны, основные типы переэкспортированы.

## Ключевая функциональность
- [cell.rs](cell.md) — `Cell`, `Bounds`, `place`, `WIDTH` × `HEIGHT` = 9 × 6;
- [orientation.rs](orientation.md) — `Orientation`;
- [kit.rs](kit.md) — `Kit`, `KitItem`;
- [placed.rs](placed.md) — `Placed`;
- [pile.rs](pile.md) — `Pile`, `Body`, склад с гравитацией; [contact.rs](contact.md) — касания его тел;
- [board.rs](board.md) — `Board`, правила поля;
- [filter.rs](filter.md) — `Filter`, `Kind`, `SortBy`;
- [file.rs](file.md) — `BuildFile`, формат экспорта игры;
- [url.rs](url.md) — запись билда в адресе;
- [labels.rs](labels.md) — `EditorLabels`;
- тесты: [board_tests.rs](board_tests.md), [file_tests.rs](file_tests.md), [pile_tests.rs](pile_tests.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
