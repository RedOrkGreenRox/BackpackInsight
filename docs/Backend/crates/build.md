# Обзор крейта builder (crates/builder/)

Crate `builder` — консольная утилита для сборки образа и CI. Она проверяет исходные JSON из `Backend/data` и картинки из `Frontend/Web/static/images/items`, а затем собирает в `Backend/generated` FlatBuffer-паки, которые читает API, и каталог `items_{en,ru}.json` для сайта, проверенный строгой моделью ядра. В рантайм-сервер утилита не входит; для сборки паков нужен внешний компилятор `flatc`.

## Команды
```bash
cargo run -p builder -- validate-all       # validate-catalog + check-images + check-locales
cargo run -p builder -- build-all-packs    # catalog_summary.fb + api_items_{en,ru}.fb + items_{en,ru}.json
cargo run -p builder -- verify-all-packs   # чтение паков через crate pack и каталога через модель ядра
```
Полный список команд — [src/main](builder/src/main.md).

## Файлы
- [src/main](builder/src/main.md) — разбор команды; корень проекта ищет [core/project_root](core/src/project_root.md).
- [catalog/mod](builder/src/catalog/mod.md) — обзор модулей: [files](builder/src/catalog/files.md), [validate](builder/src/catalog/validate.md), [images](builder/src/catalog/images.md), [locales](builder/src/catalog/locales.md), [flatbuffer](builder/src/catalog/flatbuffer.md), [api_items_flatbuffer](builder/src/catalog/api_items_flatbuffer.md), [export](builder/src/catalog/export.md).

## Какие данные куда идут
| Пак | Источник |
| :--- | :--- |
| `catalog_summary.fb` | нелокализованный каталог с наибольшей версией (`items_5_0_0.json`) |
| `api_items_en.fb`, `api_items_ru.fb` | самые новые `items_en_X_Y_Z.json` и `items_ru_X_Y_Z.json` (сейчас 7.0.0) |
| `items_en.json`, `items_ru.json` (не пак: каталог сайта) | те же файлы, проверенные моделью [core/catalog/export](core/src/catalog/export/mod.md) |

Подробнее о сборке сводки каталога — [build_flatbuffer](build_flatbuffer.md); схемы паков — [schemas](../schemas.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-06
