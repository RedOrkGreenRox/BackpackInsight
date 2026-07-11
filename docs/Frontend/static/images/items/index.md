# 🖼 Иконки предметов (images/items/)

## Назначение
Иконки всех предметов **Backpack Brawl** (~1100 шт.) в форматах AVIF и WebP. Имя файла — слаг названия предмета (например, `wooden-sword.webp`, `a-hug-in-a-mug.avif`).

## Структура
*   `avif/<slug>.avif` — приоритетный формат.
*   `webp/<slug>.webp` — fallback.

## Связи (Dependencies)
*   Путь к иконке строит [ItemIconService](../../../ground/utils/ItemIconService.md) (учитывает «маскированные» предметы и спец-логику), формат выбирает [ImageFormatService](../../../ground/utils/ImageFormatService.md).
*   SSR-страница предмета использует прямой путь `/images/items/webp/{id}.webp` ([item/[id].ts](../../../functions/item/[id].md)).
*   Соответствие имён проверяет [verify-item-images.js](../../../scripts/verify-item-images.md).

## AI-контекст
*   Слаги совпадают с [SlugService](../../../ground/utils/SlugService.md). Добавляя предмет в [items_*.json](../../../../Backend/DB/items_5_0_0.md), добавьте парные `avif`+`webp` с тем же слагом, иначе попадёте на [placeholder](../placeholder/index.md).

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок (полное покрытие сети документации).
