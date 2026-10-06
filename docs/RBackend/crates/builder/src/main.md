# [builder/main.rs](/RBackend/crates/builder/src/main.rs)

## Назначение
Консольная утилита сборки данных: проверяет исходные JSON-каталоги, картинки и локали собирает FlatBuffer-паки и пишет проверенный строгой моделью каталог `items_{en,ru}.json` в `RBackend/generated`. Запускается как `cargo run -p builder -- <команда>` при сборке образа и в CI; в рантайм API не входит.

## Команды
| Команда | Что делает | Модуль |
| :--- | :--- | :--- |
| `validate-catalog` | id, редкости, рецепты, дубли слагов | [validate](catalog/validate.md) |
| `check-images` | наличие webp и avif для каждого предмета | [images](catalog/images.md) |
| `check-locales` | совпадение id в EN и RU каталогах | [locales](catalog/locales.md) |
| `build-catalog-flatbuffer`, `verify-flatbuffer` | сборка и чтение `catalog_summary.fb` | [flatbuffer](catalog/flatbuffer.md) |
| `build-api-items-flatbuffer`, `verify-api-items-flatbuffer` | сборка и чтение `api_items_{en,ru}.fb` | [api_items_flatbuffer](catalog/api_items_flatbuffer.md) |
| `build-catalog-json`, `verify-catalog-json` | проверка экспортов строгой моделью и запись или перечитывание `items_{en,ru}.json` | [export](catalog/export.md) |
| `build-all-packs` | три сборки подряд: оба вида паков и `items_{lang}.json` | `build_all_packs` |
| `verify-all-packs` | три проверки подряд | `verify_all_packs` |
| `validate-all` | три проверки данных подряд | `validate_all` |
| `help`, `--help`, `-h` | справка | `print_help` |

Без аргументов печатает справку и выходит с кодом 2; неизвестная команда или ошибка — сообщение в stderr и код 1. Корень проекта ищет [root](root.md). Успешные команды печатают короткий итог со счётчиками.

Строки справки для сборочных команд длиннее колонки и сдвигают выравнивание — это косметика вывода.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
