# [Заполнение справочника предметов (seed.rs)](/Backend/crates/db/src/seed.rs)

## Назначение
`seed_itemdefinitions_if_empty(pool, project_root)` — заполняет таблицу `itemdefinition` справочником предметов, если в ней нет ни одной строки. Вызывается при каждом старте API ([api/state](../../api/src/state.md)); при непустой таблице возвращает 0 и ничего не делает.

## Как заполняется
1. Читает `Backend/generated/api_items_en.fb` и `api_items_ru.fb` и декодирует их `decode_items` ([middleware/items](../../middleware/src/items.md)).
2. Для каждого английского предмета берёт русское имя по совпадению `id` (нет перевода — пустая строка).
3. Вставляет все строки одним запросом и возвращает их число.

Если файла пака нет, функция возвращает ошибку — комментарий в исходнике обещает в этом случае 0, но код до этого не доходит. Ошибка останавливает старт API.

## Внутреннее
- `SeedRow` — `item_id`, `name`, `name_ru`, `rarity`, `coin_value`, `connected_hero`, `unlock_source`, `purchasable`.
- `build_seed_insert(rows)` — `INSERT` в восемь колонок с плейсхолдерами `$N`; повторяет логику `build_bulk_insert` из [profile](profile.md) с фиксированным префиксом.

## Тесты
`build_seed_insert_2_rows`, `build_seed_insert_single_row_uses_8_placeholders`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
