# [Ключ картинки предмета (image_key.rs)](/RBackend/crates/core/src/image_key.rs)

## Назначение
`ItemIconService` выбирает ключ картинки предмета (имя файла без расширения). Правила повторяют фронтендовые [ItemIconService.ts](../../../../Frontend/ground/utils/ItemIconService.md); проверку картинок по этим правилам делает `cli check-images` ([main](../../cli/src/main.md)).

## Типы
- `ImageKey(String)` — newtype ключа; `new_unchecked`, `as_str`, `Display`.

## `ItemIconService::image_key(name, rarity, first_tooltip)`
Порядок правил:
1. **Маскировка** (`masked_item_key`): семь предметов используют чужую графику — `Suspicious Sausage` → `tender-sausage`, `Fools Gold` → `gold-ore`, `Feral Cat` → `black-cat`, `Cursed Dagger` → `poison-dagger`, `Book of Dark Secrets` → `dusty-book`, `Blind Fury Potion` → `wrath-potion`, `Feather of Icarus` → `phoenix-feather`.
2. **Планы ограбления**: для редкости `Special`, если первый тултип начинается со «Step N» (арабское или римское число), ключ — `heist-plan-N` (`heist_plan_step`).
3. Иначе — slug имени ([slug](slug.md)).

## Потребители
- [catalog/columns](catalog/columns.md), [builder/catalog/images](../../builder/src/catalog/images.md), [builder/catalog/flatbuffer](../../builder/src/catalog/flatbuffer.md), [cli](../../cli/src/main.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
