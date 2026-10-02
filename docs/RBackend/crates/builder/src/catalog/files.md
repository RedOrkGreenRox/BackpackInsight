# [builder/catalog/files.rs](/RBackend/crates/builder/src/catalog/files.rs)

## Назначение
Где лежат исходные данные и как их читать. Общий модуль для всех проверок и сборок.

## Функции
- `db_dir(root)` — `Backend/DB`; `web_root(root)` — `Frontend/Web`.
- `localized_files(root)` — пара `items_en_5_1_0.json` и `items_ru_5_1_0.json`; версия зашита в код.
- `latest_plain_items_file(root)` — нелокализованный каталог `items_X_Y_Z.json` с наибольшей версией; если таких нет — `items_5_0_0.json`. Сейчас в `Backend/DB` это `items_5_0_0.json`.
- `plain_items_version(name)` — версия из имени `items_X_Y_Z.json`; файлы `items_en_*`, `items_ru_*` и `items_tooltips.json` не считаются.
- `read_items_array(path)` — JSON-массив или поле `items` объекта; иначе ошибка с путём файла.

Нелокализованный каталог читают [validate](validate.md), [images](images.md) и [flatbuffer](flatbuffer.md); локализованные — [locales](locales.md) и [api_items_flatbuffer](api_items_flatbuffer.md). Поэтому `catalog_summary.fb` и `api_items_*.fb` собираются из разных версий данных (5.0.0 и 5.1.0).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
