# [Тест деталей предмета (item_detail.test.ts)](../../../Frontend/Web/tests/item_detail.test.ts)

## Назначение
Vitest-тесты логики навигации по предметам на странице деталей.

## Связи (Dependencies)
*   Тестирует [ItemDetailBranch](../ground/branches/itemDetail/ItemDetailBranch.md) и [ItemNavigationManager](../ground/branches/itemDetail/_itemDetail/managers/ItemNavigationManager.md).
*   Мокает [i18n](../ground/localization/i18n.md).

## Покрытие
*   Корректность вычисления соседних предметов (prev/next) для wiki-режима.

## AI-контекст
*   Импорты актуальны (модули существуют). При изменении логики навигации обновляйте этот тест.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
