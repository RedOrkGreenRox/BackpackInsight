# [Тесты модели экспорта (tests.rs)](/Backend/crates/core/src/catalog/export/tests.rs)

## Назначение
Тесты модели экспорта [export/mod.rs](mod.md) на настоящих файлах `Backend/data/items_{en,ru}_5_1_0.json` и на маленьком искусственном экспорте.

## Тесты
- `real_exports_parse_and_round_trip` — оба файла 5.1.0 разбираются, в каждом 1038 предметов, а запись обратно в JSON и повторный разбор дают ту же модель (ничего не теряется).
- `known_item_is_typed` — у `Abyssal Embrace` редкость `Mythic`, 6 клеток формы, перезарядка 4.6 и 14 уровней.
- `minimal_export_parses` — минимальный экспорт из одного предмета принимается.
- `fields_added_in_7_0_are_known` — `embargoCode` и `absorbEffect` из экспорта 7.0.0 принимаются и попадают в `embargo_code` и `absorb_effect`.
- `rejects_unknown_rarity_field_and_count` — незнакомая редкость и лишнее поле дают `ExportError::Json`, неверный `itemCount` даёт `ExportError::Count { declared: 2, actual: 1 }`.

Помощники: `source(lang)` читает файл экспорта относительно `CARGO_MANIFEST_DIR`, `minimal(item_count, rarity, extra)` собирает JSON с одним предметом.

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
