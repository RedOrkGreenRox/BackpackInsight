# core catalog — typed IDs и string interning

`catalog/*` — начало data-oriented корня для будущего каталога.

Эта контрольная точка закрывает первые два пункта из намеченного performance/data плана:

```text
1. typed IDs вместо голых чисел/строк
2. catalog/strings модуль для string interning
```

Структура:

```text
catalog/ids.rs       ItemId, HeroId, StringId
catalog/strings.rs   StringPool
catalog/mod.rs       re-export
```

Назначение:

```text
не таскать строки и указатели по всему runtime,
а постепенно переходить к компактным ID и string pool.
```

Это ещё не полный DOD-каталог. `CatalogColumns` и FlatBuffer packs появятся позже. Сейчас добавлен только минимальный фундамент: безопасные ID-типы и интернирование строк.

CLI-команда:

```bash
cargo run -p cli -- intern "Wooden Sword" "Wooden Sword" "Apple"
```

---
> 📌 **Подпись документации:** typed IDs/string interning контрольная точка, 2026-07-06.


## Следующая контрольная точка

Добавлен `catalog/columns.rs` с первым DOD-скелетом `CatalogColumns`. См. [core_catalog_columns](core_catalog_columns.md).
