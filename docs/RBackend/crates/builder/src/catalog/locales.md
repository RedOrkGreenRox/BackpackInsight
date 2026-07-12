# [builder/catalog/locales.rs](/RBackend/crates/builder/src/catalog/locales.rs)

## Назначение
Проверка консистентности `en`/`ru` локализаций: число предметов, пересечение по `id`, отчёт о пропущенных.

## Ключевая функциональность
- `LocaleCheckReport { en_items, ru_items, shared_items }`.
- `check_locales(project_root)` — сравнивает два JSON-набора.

## Связи
- Вход: [files.rs](files.md) → `localized_files`.
- Вызов: [catalog/mod.rs](mod.md) из [builder/src/main.rs](../main.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
