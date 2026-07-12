# [api/profile/mod.rs](/RBackend/crates/api/src/profile/mod.rs)

## Назначение
Агрегатор подмодулей profile-обработки: чтение каталога, heroes, items, JSON-input, сборка `ProfileViewResponse`, регрессионные тесты.

## Подмодули
- [catalog_cache.rs](catalog_cache.md) — кеш каталога предметов.
- [heroes.rs](heroes.md) — проецирование героев.
- [items.rs](items.md) — проецирование предметов.
- [json_input.rs](json_input.md) — нормализация JSON-входа.
- [view.rs](view.md) — сборка `ProfileViewResponse`.
- `regression_tests` (только `#[cfg(test)]`) — [regression_tests.rs](regression_tests.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
