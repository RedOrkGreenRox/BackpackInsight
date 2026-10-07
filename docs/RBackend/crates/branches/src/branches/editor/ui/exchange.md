# [branches/branches/editor/ui/exchange.rs](/RBackend/crates/branches/src/branches/editor/ui/exchange.rs)

## Назначение
`Exchange(labels, dialog)` — окно импорта и экспорта билда в формате игры ([model/file.rs](../model/file.md)).

## Ключевая функциональность
- `Dialog` (`Import`, `Export`).
- При открытии экспорта текст — `export_json` (красивый JSON), с кнопкой «Скачать .json» (`json_data_url`, [dom.rs](dom.md)); поле только для чтения.
- Импорт: `import_json` разбирает текст, раскладывает билд и ставит героя; ошибка разбора или неизвестные предметы показываются в окне (`aria-live`), иначе окно закрывается.
- Щелчок по затемнению закрывает окно.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
