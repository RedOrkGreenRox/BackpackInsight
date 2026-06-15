# [Тултипы предметов (items_tooltips.json)](../../../Backend/DB/items_tooltips.json)

## Назначение
Отдельный справочник текстовых описаний (tooltips) предметов — исходник для парсера иконок.

## Связи (Dependencies)
*   Исключается из автоподбора версий в [data.py](../playerdata/data.md) (фильтр `'tooltips' not in filename`).
*   Обрабатывается [icon_parser.py](../playerdata/builds/icon_parser.md) / [icon-parser.ts](../../frontend/ground/utils/icon-parser.md) для генерации HTML с иконками.

## AI-контекст
*   Намеренно не участвует в выборе «последней версии предметов». Тексты содержат игровые термины (Damage/Poison/Star...), которые парсер заменяет на иконки.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
