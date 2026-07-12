# [api/profile/items.rs](/RBackend/crates/api/src/profile/items.rs)

## Назначение
Проецирование предметов профиля: парсит `Items` из входного JSON, считает уровни/карточки/total_xp, формирует `ProfileItemView` (для FlatBuffer) + `ProfileItemRecord { item_id, total_xp }` (для DB).

## Ключевая функциональность
- `ProfileItemView { name, rarity, level, cards, cards_need, total_xp }`.
- `ProfileItemRecord { item_id, total_xp }` — параллельный DB-носитель (см. SQL-1 worklog).
- `item_stats` — расчёт XP по редкости.
- `read_items(json, lang)` — индекс по слагам из [catalog_cache](catalog_cache.md).

## Связи
- Ядро: [core/profile/items](/docs/RBackend/crates/core_items.md).
- Каталог: [catalog_cache.rs](catalog_cache.md).
- Сборка: [view.rs](view.md).
- DB-сценарий: [routes/profile_binary.rs](../routes/profile_binary.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
