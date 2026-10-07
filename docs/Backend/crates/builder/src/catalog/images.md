# [Проверка картинок предметов (images.rs)](/Backend/crates/builder/src/catalog/images.rs)

## Назначение
`check_images(root)` — для каждого предмета нелокализованного каталога должны существовать `Frontend/Web/static/images/items/webp/<key>.webp` и `avif/<key>.avif`.

## Как ищется файл
1. Ключ картинки — `ItemIconService::image_key` ([core/image_key](../../../core/src/image_key.md)) от имени (или id), редкости и первой подсказки.
2. Если файла нет и id отличается от имени, пробуется ключ от id.
3. Иначе в отчёт идёт строка с форматом, именем и ожидаемым путём.

Результат `RarityService::parse` отбрасывается — неизвестная редкость не считается ошибкой.

## API
- `ImageCheckReport` — `items`, `files_checked` (два на предмет).
- `format_errors(title, errors)` — сводка с первыми 100 ошибками.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
