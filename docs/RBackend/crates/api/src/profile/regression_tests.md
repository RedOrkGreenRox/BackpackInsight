# [api/profile/regression_tests.rs](/RBackend/crates/api/src/profile/regression_tests.rs)

## Назначение
Регрессионный тест на ingestion 13 реальных игровых профилей (паритет с Python `tests/test_profiles_integration.py`). Запускается только в `#[cfg(test)]`.

## Ключевая функциональность
- `KNOWN_RAW_HERO_NAMES` — список канонических имён героев.
- Прогоняет `profile_view(json, Lang::En)` на каждом фикстуре из `RBackend/tests/fixtures/profiles/*.json`.
- Сравнивает ключевые поля с эталонными значениями.

## Связи
- Тестирует: [view.rs](view.md).
- Фикстуры: `RBackend/tests/fixtures/profiles/`.

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
