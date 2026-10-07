# [Порядок редкостей (rarity.rs)](/RBackend/crates/branches/src/catalog/rarity.rs)

## Назначение
Порядок редкостей для сортировки каталога по умолчанию: от самой ценной к самой простой. Повторяет `RARITY_WEIGHTS` TS-версии ([sort-service.ts](/docs/Frontend/ground/branches/items/_items/managers/filter/sort-service.md)), поэтому сетка начинается с тех же предметов, что и на старом сайте.

## Ключевая функциональность
- **`rank(rarity: ItemRarity) -> u8`** — место редкости: `Unique` 0, `Mythic` 1, `Legendary` 2, `Epic` 3, `Rare` 4, `Common` 5, `Boon` 6, `Relic` 7, `Special` 8. Сопоставление полное (`match` без `_`): если в `ItemRarity` ([core/profile/items/types.rs](/docs/RBackend/crates/core/src/profile/items/types.md)) появится новая редкость, крейт не соберётся, пока ей не найдут место здесь. Неизвестной редкости в каталоге быть не может: её отвергает модель экспорта.

## Тесты
- `unique_first_special_last` — `Unique` раньше `Mythic`, `Common` раньше `Special`, у `Special` место 8.

## Связи
- Единственный потребитель: `LangCatalog::new` в [catalog/mod.rs](mod.md).
- Цвета редкостей в карточках: [items/card.rs](../branches/items/card.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
