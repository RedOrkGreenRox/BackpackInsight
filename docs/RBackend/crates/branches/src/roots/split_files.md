# [branches/roots/split_files.rs](/RBackend/crates/branches/src/roots/split_files.rs)

## Назначение
`SplitFiles` — имена файлов в каталоге `pkg`, которые нужны ленивым островам ([lazy.rs](lazy.md)): основной JS сайта, манифест разбиения WASM и JS-загрузчик кусков. Учитывает настройку `hash-files` cargo-leptos, при которой к именам добавляется хэш.

## Ключевая функциональность
- **`SplitFiles { js, manifest, loader }`** — имена без пути.
- **`SplitFiles::resolve(options)`** — если `options.hash_files`, читает файл хэшей `options.hash_file` рядом с бинарником (`current_exe`), строки `ключ: хэш`; иначе таблица пуста. Так же этот файл читает Leptos в `HydrationScripts`, поэтому имена совпадают с теми, что он ставит в `<head>`.
- **`named(output_name, hashes)`** — имена по таблице:

| Файл | Без хэша | С хэшем (ключ) |
| :--- | :--- | :--- |
| `js` | `<output_name>.js` | `<output_name>.<хэш>.js` (`js`) |
| `manifest` | `__wasm_split_manifest.json` | `__wasm_split_manifest.<хэш>.json` (`manifest`) |
| `loader` | `__wasm_split.______________________.js` | `__wasm_split.<хэш>.js` (`split`) |

- `read_hashes` — разбор файла хэшей; нет файла → пустая таблица, и используются имена без хэша.

## Тесты
- `plain_names_without_hashes` — имена без `hash-files`.
- `hashed_names_follow_hash_file` — имена с хэшами из таблицы.

Вручную проверено (2026-10-03): сайт с переименованными по хэшам файлами и `LEPTOS_HASH_FILES=true` ставит ссылки на `__wasm_split.<хэш>.js` и куски WASM из хэшированного манифеста.

## Связи
- Кто использует: `LazyIslands::load` в [lazy.rs](lazy.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-03.
