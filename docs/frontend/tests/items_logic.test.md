# [Тест логики каталога предметов (items_logic.test.ts)](../../../Frontend/Web/tests/items_logic.test.ts)

## Назначение
Vitest-тесты фильтрации/состояния/иконок каталога предметов.

## ⚠️ Статус: УСТАРЕЛ (мёртвые импорты)
Тест импортирует несуществующие модули:
*   `ground/branches/items/_items/managers/ItemsFilterManager` — нет такого файла.
*   `ground/branches/items/_items/managers/ItemsStateManager` — нет.
*   `ground/branches/items/_items/services/ItemsIconService` — нет.

Вся логика каталога сейчас сосредоточена в монолитном [ItemsBranch](../ground/branches/items/ItemsBranch.md) (см. план распила в README).

## AI-контекст
*   **Требует действия по идеологии**: сначала исправить код/тест (восстановить модули или переписать тест под `ItemsBranch`), затем привести этот док в соответствие. Сейчас тест не запускается.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
