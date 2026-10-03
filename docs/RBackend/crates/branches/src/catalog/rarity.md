# [branches/catalog/rarity.rs](/RBackend/crates/branches/src/catalog/rarity.rs)

## Назначение
Порядок редкостей для сортировки каталога по умолчанию: от самой ценной к самой простой. Повторяет `RARITY_WEIGHTS` TS-версии ([sort-service.ts](/docs/Frontend/ground/branches/items/_items/managers/filter/sort-service.md)), поэтому сетка начинается с тех же предметов, что и на старом сайте.

## Ключевая функциональность
- **`ORDER`** (приватная константа) — `Unique`, `Mythic`, `Legendary`, `Epic`, `Rare`, `Common`, `Boon`, `Relic`, `Special`.
- **`rank(rarity)`** — позиция редкости в `ORDER`. Неизвестная редкость получает `ORDER.len()` (9) и уходит в конец, поэтому новая редкость в паке не ломает сортировку.

## Тесты
- `unique_first_unknown_last` — `Unique` раньше `Mythic`, `Common` раньше `Special`, неизвестная редкость получает 9.

## Связи
- Единственный потребитель: `LangCatalog::new` в [catalog/mod.rs](mod.md).
- Цвета редкостей в карточках: [items/card.rs](../branches/items/card.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
