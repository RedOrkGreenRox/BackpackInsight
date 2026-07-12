# [db/seed.rs](/RBackend/crates/db/src/seed.rs)

## Назначение
Idempotent-сидер `itemdefinition` из FlatBuffer-каталогов `api_items_{en,ru}.fb`. Вызывается из `AppState::discover()` при старте.

## Ключевая функциональность
- `seed_itemdefinitions_if_empty(pool, project_root)` — no-op если таблица не пуста.
- Использует `middleware::decode_items` для распаковки FlatBuffer.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
