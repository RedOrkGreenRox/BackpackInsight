# core catalog columns — первый DOD-скелет каталога

`catalog/columns.rs` — первая data-oriented заготовка каталога.

Это ещё не полный игровой каталог и не FlatBuffers pack. Это маленький foundation для будущего хранения предметов колонками.

Структура данных:

```text
CatalogItemInput     вход одной строки каталога
CatalogColumns       колоночное хранение каталога
```

Колонки текущей контрольной точки:

```text
item_ids:   Vec<StringId>
names:      Vec<StringId>
slugs:      Vec<StringId>
image_keys: Vec<StringId>
rarities:   Vec<ItemRarity>
strings:    StringPool
```

Смысл:

```text
строки интернируются один раз,
строки предметов ссылаются на StringId,
строки каталога получают ItemId,
данные начинают двигаться от Vec<ItemObject> к DOD-формату.
```

CLI-команда:

```bash
cargo run -p cli -- catalog-summary
```

---
> 📌 **Подпись документации:** первый DOD-скелет каталога, 2026-07-06.
