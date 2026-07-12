# [api/profile/view.rs](/RBackend/crates/api/src/profile/view.rs)

## Назначение
Сборка `ProfileViewResponse` — полного ответа API профиля. Компонует identity/wallet/score/heroes/items, добавляет `item_records: Vec<ProfileItemRecord>` (DB-only parallel carrier).

## Ключевая функциональность
- `ProfileViewResponse { identity, wallet, score, area, heroes: Vec<ProfileHeroView>, items: Vec<ProfileItemView>, item_records: Vec<ProfileItemRecord> }`.
- `profile_view(json, lang)` — главный оркестратор.
- `ProfileErrorResponse { code, detail }` для ошибок.
- `to_pack(...)` — упаковка в FlatBuffer `BIPR` (item_records намеренно опускаются, т.к. .fbs не имеет их полей).

## Связи
- Источники: [heroes.rs](heroes.md), [items.rs](items.md), [json_input.rs](json_input.md).
- Каталог: [catalog_cache.rs](catalog_cache.md).
- Ядро: [core/profile](/docs/RBackend/crates/core.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
