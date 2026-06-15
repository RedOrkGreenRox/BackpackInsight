# [Справочник предметов v4.0.0 (items_4_0_0.json)](../../../Backend/DB/items_4_0_0.json)

## Назначение
Статический справочник всех предметов **Backpack Brawl** версии игры 4.0.0. Структура: `{appVersion, buildNumber, exportDate, language, embargoed, itemCount, items:[...]}`.

## Связи (Dependencies)
*   Загружается [data.py](../playerdata/data.md): функция `get_latest_items_file()` автоматически выбирает файл со **старшей** версией (по имени `items_MAJOR_MINOR_PATCH.json`).
*   Синхронизируется в БД (`ItemDefinition`) при старте [api.py](../playerdata/api.md) по SHA-256.

## Структура элемента `items[]`
*   `id`, `name`, `rarity`, `coinValue`, `itemTypes[]`, `connectedHero`, `unlockSource`, `itemShape[]`, `itemStars[]`, `purchasable`, `recipes[]`, `combatStats{}`, `allStats{}`, `tooltips[]`, `levels{}`.

## AI-контекст
*   Версионирование — по имени файла. Чтобы обновить игровые данные, добавьте новый `items_X_Y_Z.json` (старший по версии) — приложение подхватит его автоматически и пересинхронизирует БД. Сейчас актуальна v5.0.0.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
