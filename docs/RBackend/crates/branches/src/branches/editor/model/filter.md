# [branches/branches/editor/model/filter.rs](/RBackend/crates/branches/src/branches/editor/model/filter.rs)

## Назначение
`Filter` — состояние панели каталога: `query`, `hero`, `kind`, `rarity`, `sort`; `apply(kit)` — номера подходящих предметов в нужном порядке.

## Ключевая функциональность
- `Kind` (`All`, `Bags`, `Items`) и `SortBy` (`Rarity`, `Name`, `Price`): `ALL` — пары «вариант — значение `<select>`», `parse`.
- `accepts(item, query)` — герой (его предметы и `Shared`), вид, редкость, текст в имени, `id` или типах.
- Сортировка: по месту редкости, по имени, по убыванию цены.
- `rarities(kit)` — редкости набора от ценной к простой.

## Связи
- Панель: [ui/palette.rs](../ui/palette.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
