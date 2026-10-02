# [Тест деталей предмета (item_detail.test.ts)](../../../Frontend/Web/tests/item_detail.test.ts)

## Назначение
Vitest-набор `ItemDetail Managers` для старой страницы деталей предмета: навигация «предыдущий/следующий» и SEO-метаданные.

## Сценарии
- `ItemNavigationManager`: соседние предметы для библиотеки (`filteredItemsOrder`) и для профиля (`profileItemsList`), а также `null`-соседи, если предмет не найден.
- `ItemDetailBranch SEO`: `getMeta()` содержит имя предмета и даёт запасной заголовок без данных.
- `i18n` замокан: `t()` возвращает ключ (с JSON параметров).

## Текущее состояние
Тест импортирует модули старого расположения — `ground/branches/itemDetail/ItemDetailBranch` и `ground/branches/itemDetail/_itemDetail/managers/ItemNavigationManager`. Этих файлов в кодовой базе больше нет: подстраница переехала в `ground/branches/items/itemDetail/`, а навигация стала приватным методом `calculateNavigation` в [ItemDetailData](../ground/branches/items/itemDetail/_itemDetail/data/ItemDetailData.md). Поэтому набор не проходит этап разрешения импортов и требует переписывания под [ItemDetail_Branch](../ground/branches/items/itemDetail/ItemDetail_Branch.md).

## Связи
- Мокает [i18n](../ground/localization/i18n.md).
- Конфигурация запуска — [vitest.config](../vitest.config.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
