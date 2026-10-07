# [Проверка локализаций (locales.rs)](/RBackend/crates/builder/src/catalog/locales.rs)

## Назначение
`check_locales(root)` — EN и RU каталоги (`localized_files`, см. [files](files.md)) должны содержать одинаковый набор `id`. При расхождении ошибка показывает до 30 id с каждой стороны.

## API
- `LocaleCheckReport` — `en_items`, `ru_items`, `shared_items` (число уникальных id).
- `ids(items)` — множество строковых `id`.

## Тесты
`repository_locales_have_same_ids` — на данных репозитория числа совпадают и id больше 1000.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
