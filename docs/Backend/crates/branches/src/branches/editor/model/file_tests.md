# [Тесты файла билда и адреса (file_tests.rs)](/Backend/crates/branches/src/branches/editor/model/file_tests.rs)

## Назначение
Тесты файла билда и записи в адресе на экспорте билда Mycella из игры 7.0.0 (константа `GAME`).

## Ключевая функциональность
- `game_export_lays_out_without_losses` — 3 сумки и 5 предметов встают на поле, неизвестный `id` попадает в `unknown`.
- `export_drops_run_and_round_trips` — в экспорте нет `run` и уровня, есть `slotPositions`; экспорт читается обратно в то же поле.
- `url_code_round_trips` — `encode_field`/`decode` дают то же поле; битые записи пропускаются.

## Связи
- [file.rs](file.md), [url.rs](url.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
