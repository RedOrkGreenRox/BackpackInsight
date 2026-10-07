# [Модель экспорта игры (mod.rs)](/Backend/crates/core/src/catalog/export/mod.rs)

## Назначение
Экспорт каталога из игры (`Backend/data/items_{lang}_X_Y_Z.json`) в строгих типах. Это единственная модель данных предмета для всего Rust-кода: [builder](/docs/Backend/crates/builder/src/catalog/export.md) проверяет ею экспорт при сборке и пишет нормализованную копию в `Backend/generated/items_{lang}.json`, а сайт ([branches/catalog/load.rs](/docs/Backend/crates/branches/src/catalog/load.md)) читает ту же модель при старте. Решение Ивана от 2026-10-06: каталог хранится как JSON игры в строгой Rust-модели, а не в FlatBuffers.

## Ключевая функциональность
- **Реэкспорт:** `ItemDef` ([item.rs](item.md)); `Cell`, `Recipe`, `CombatStats`, `Levels`, `LevelChange` ([parts.rs](parts.md)). Подмодуль `rarity` ([rarity.rs](rarity.md)) приватный, `tests` ([tests.rs](tests.md)) есть только в тестовой сборке.
- **`CatalogExport`** — файл экспорта целиком, `deny_unknown_fields`:

| Поле | Ключ JSON | Примечание |
| :--- | :--- | :--- |
| `app_version` | `appVersion` | версия игры, например `5.1.0` |
| `build_number` | `buildNumber` | строка |
| `export_date` | `exportDate` | строка как в файле |
| `language` | `language` | не проверяется: у RU-файла 5.1.0 там ошибочно `en`, с 7.0.0 — `ru-RU` |
| `tooltip_level` | `tooltipLevel` | `Option<String>`, есть с 7.0.0 (`max`): для какого уровня подставлены числа в тултипы |
| `embargoed` | `embargoed` | включены ли скрытые предметы |
| `item_count` | `itemCount` | заявленное число предметов |
| `items` | `items` | `Vec<ItemDef>` |

- **Версии формата:** модель принимает экспорты 5.1.0 и 7.0.0. Поля, появившиеся в 7.0.0, — `Option` с `#[serde(default)]`, а при записи `None` пропускается (`skip_serializing_if`), поэтому нормализованный 5.1.0 совпадает с исходным. Любое другое новое поле по-прежнему ошибка: его надо добавить в модель явно.
- **`CatalogExport::parse(bytes)`** — `serde_json::from_slice` в модель, затем сверка `item_count` с длиной `items`.
- **`ExportError`** — почему экспорт не принят: `Json(serde_json::Error)` (битый JSON, незнакомое поле, незнакомая редкость, не тот тип значения) или `Count { declared, actual }`. Реализует `Display` и `std::error::Error` (`source` у `Json` — исходная ошибка serde).

## Почему так
Замеры 2026-10-06 на экспорте 5.1.0 (1038 предметов): строгий разбор JSON занимает около 7,7 мс против 34 мс у чтения обобщённого пака `api_items_en.fb`; JSON после brotli весит 66 КБ, пак 503 КБ, строгая схема FlatBuffers весила бы 108 КБ. Браузер каталог целиком не получает (страницы приходят HTML, остров получает порции), поэтому формат хранения выбран по простоте и строгости.

## Связи
- Корень каталога ядра: [catalog/mod.rs](../mod.md). Редкость: `ItemRarity` из [profile/items/types.rs](../../profile/items/types.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
