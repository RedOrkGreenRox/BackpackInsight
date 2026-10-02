# [builder/main.rs](/RBackend/crates/builder/src/main.rs)

## Назначение
Консольная утилита сборки данных: проверяет исходные JSON-каталоги, картинки и локали и собирает FlatBuffer-паки в `RBackend/generated`. Запускается как `cargo run -p builder -- <команда>` при сборке образа и в CI; в рантайм API не входит.

## Команды
| Команда | Что делает | Модуль |
| :--- | :--- | :--- |
| `validate-catalog` | id, редкости, рецепты, дубли слагов | [validate](catalog/validate.md) |
| `check-images` | наличие webp и avif для каждого предмета | [images](catalog/images.md) |
| `check-locales` | совпадение id в EN и RU каталогах | [locales](catalog/locales.md) |
| `build-catalog-flatbuffer`, `verify-flatbuffer` | сборка и чтение `catalog_summary.fb` | [flatbuffer](catalog/flatbuffer.md) |
| `build-api-items-flatbuffer`, `verify-api-items-flatbuffer` | сборка и чтение `api_items_{en,ru}.fb` | [api_items_flatbuffer](catalog/api_items_flatbuffer.md) |
| `build-all-packs` | обе сборки подряд | `build_all_packs` |
| `verify-all-packs` | обе проверки подряд | `verify_all_packs` |
| `validate-all` | три проверки данных подряд | `validate_all` |
| `help`, `--help`, `-h` | справка | `print_help` |

Без аргументов печатает справку и выходит с кодом 2; неизвестная команда или ошибка — сообщение в stderr и код 1. Корень проекта ищет [root](root.md). Успешные команды печатают короткий итог со счётчиками.

Строки справки для сборочных команд длиннее колонки и сдвигают выравнивание — это косметика вывода.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
