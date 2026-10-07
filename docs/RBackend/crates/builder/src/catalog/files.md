# [Исходные данные сборки (files.rs)](/RBackend/crates/builder/src/catalog/files.rs)

## Назначение
Где лежат исходные данные и как их читать. Общий модуль для всех проверок и сборок.

## Функции
- `db_dir(root)` — `Backend/DB`; `web_root(root)` — `Frontend/Web`.
- `localized_files(root)` — пара самых новых `items_en_X_Y_Z.json` и `items_ru_X_Y_Z.json` (сейчас 7.0.0). Новый экспорт достаточно положить в `Backend/DB` рядом со старыми. Версии языков выбираются отдельно; если они разойдутся, это поймают `check_locales` и `build_catalog_json` по наборам `id`.
- `latest_localized_file(root, lang)` (приватная) — самый новый `items_{lang}_X_Y_Z.json`; если такого нет — `items_{lang}_5_1_0.json`.
- `latest_plain_items_file(root)` — нелокализованный каталог `items_X_Y_Z.json` с наибольшей версией; если таких нет — `items_5_0_0.json`. Сейчас в `Backend/DB` это `items_5_0_0.json`.
- `plain_items_version(name)` — версия из имени `items_X_Y_Z.json`; файлы `items_en_*`, `items_ru_*` и `items_tooltips.json` не считаются.
- `parse_version(text)` (приватная) — `X_Y_Z` → `(X, Y, Z)`, общая для обоих поисков.
- `read_items_array(path)` — JSON-массив или поле `items` объекта; иначе ошибка с путём файла.

Нелокализованный каталог читают [validate](validate.md), [images](images.md) и [flatbuffer](flatbuffer.md); локализованные — [locales](locales.md) и [api_items_flatbuffer](api_items_flatbuffer.md). Поэтому `catalog_summary.fb` и `api_items_*.fb` собираются из разных версий данных (5.0.0 и 7.0.0).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-06
