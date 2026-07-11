# [Статистика текста предметов (item-text-statistics.json)](../../../Frontend/Web/tmp/item-text-statistics.json)

## Назначение
Сгенерированный отчёт-артефакт: частотный анализ слов/символов в описаниях предметов. Вывод инструмента анализа, помогает настраивать стоп-слова и синонимы поиска.

## Связи (Dependencies)
*   Создаётся скриптом [analyze-item-text.js](../scripts/analyze-item-text.md) из `Backend/DB/items_*.json`.
*   Помогает наполнять [term-aliases.ru.json](../static/search/term-aliases.ru.md).

## Структура
*   `source`, `itemsCount`, `settings` (minWordLength, stopwordsCount), `chars`, топ-частоты токенов.

## AI-контекст
*   Это **артефакт** (папка `tmp/`), а не исходник — может перегенерироваться. Не редактируйте вручную; обновляйте через `npm run analyze:item-text`.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
