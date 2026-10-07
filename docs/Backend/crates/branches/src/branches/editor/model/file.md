# [Файл билда в формате игры (file.rs)](/Backend/crates/branches/src/branches/editor/model/file.rs)

## Назначение
`BuildFile` — билд в формате экспорта из игры, только то, что относится к билду: `gameVersion`, `hero.name`, `inventoryItems`, `storageItems`. При чтении `run`, уровень героя и имена предметов пропускаются, при записи не выводятся.

## Ключевая функциональность
- `HeroRef { name }`, `FileItem { id, position, orientation, slotPositions }` (необязательные поля не пишутся, если пусты).
- `export(kit, board, hero)` — сначала сумки, потом предметы, затем склад; `slotPositions` считаются из формы.
- `import(kit)` → `Imported { board, hero, unknown }`: сумки ставятся первыми, затем предметы, через `Board::put`; без позиции или поворота — на склад; неизвестные `id` собираются в `unknown`.

## Связи
- Окно импорта/экспорта: [ui/exchange.rs](../ui/exchange.md). Тесты: [file_tests.rs](file_tests.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
