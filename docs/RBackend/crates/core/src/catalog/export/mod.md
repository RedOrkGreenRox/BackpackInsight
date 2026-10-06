# [core/catalog/export/mod.rs](/RBackend/crates/core/src/catalog/export/mod.rs)

## Назначение
Экспорт каталога из игры (`Backend/DB/items_{lang}_X_Y_Z.json`) в строгих типах. Это единственная модель данных предмета для всего Rust-кода: [builder](/docs/RBackend/crates/builder/src/catalog/export.md) проверяет ею экспорт при сборке и пишет нормализованную копию в `RBackend/generated/items_{lang}.json`, а сайт ([branches/catalog/load.rs](/docs/RBackend/crates/branches/src/catalog/load.md)) читает ту же модель при старте. Решение Ивана от 2026-10-06: каталог хранится как JSON игры в строгой Rust-модели, а не в FlatBuffers.

## Ключевая функциональность
- **Реэкспорт:** `ItemDef` ([item.rs](item.md)); `Cell`, `Recipe`, `CombatStats`, `Levels`, `LevelChange` ([parts.rs](parts.md)). Подмодуль `rarity` ([rarity.rs](rarity.md)) приватный, `tests` ([tests.rs](tests.md)) есть только в тестовой сборке.
- **`CatalogExport`** — файл экспорта целиком, `deny_unknown_fields`:

| Поле | Ключ JSON | Примечание |
| :--- | :--- | :--- |
| `app_version` | `appVersion` | версия игры, например `5.1.0` |
| `build_number` | `buildNumber` | строка |
| `export_date` | `exportDate` | строка как в файле |
| `language` | `language` | не проверяется: у RU-файла 5.1.0 там ошибочно `en` |
| `embargoed` | `embargoed` | включены ли скрытые предметы |
| `item_count` | `itemCount` | заявленное число предметов |
| `items` | `items` | `Vec<ItemDef>` |

- **`CatalogExport::parse(bytes)`** — `serde_json::from_slice` в модель, затем сверка `item_count` с длиной `items`.
- **`ExportError`** — почему экспорт не принят: `Json(serde_json::Error)` (битый JSON, незнакомое поле, незнакомая редкость, не тот тип значения) или `Count { declared, actual }`. Реализует `Display` и `std::error::Error` (`source` у `Json` — исходная ошибка serde).

## Почему так
Замеры 2026-10-06 на экспорте 5.1.0 (1038 предметов): строгий разбор JSON занимает около 7,7 мс против 34 мс у чтения обобщённого пака `api_items_en.fb`; JSON после brotli весит 66 КБ, пак 503 КБ, строгая схема FlatBuffers весила бы 108 КБ. Браузер каталог целиком не получает (страницы приходят HTML, остров получает порции), поэтому формат хранения выбран по простоте и строгости.

## Связи
- Корень каталога ядра: [catalog/mod.rs](../mod.md). Редкость: `ItemRarity` из [profile/items/types.rs](../../profile/items/types.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
