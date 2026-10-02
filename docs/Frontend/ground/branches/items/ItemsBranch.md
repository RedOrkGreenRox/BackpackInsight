# [Список всех предметов (ItemsBranch.ts)](../../../../../Frontend/Web/ground/branches/items/ItemsBranch.ts)

## Назначение
Сборка страницы `/items` (библиотека предметов) на [BranchSpec](../../roots/BranchSpec.md) + [BranchRunner](../../roots/BranchRunner.md). Файл содержит три модуля контракта [StructuredBranch](../../roots/StructuredBranch.md) и спецификацию; вся интерактивность — в [ItemsManager](_items/managers/ItemsManager.md).

## Контекст `ItemsContext`
`items` (каталог `ItemDefinition[]`), `detailName` (значение `?item=`) и `searchQuery` (значение `?search=` или `null`). Тип `ItemDefinition` реэкспортируется из [api-types](../../types/api-types.md).

## Модули
- `ItemsDisplay` — `renderSkeleton()` и `renderFullPage()` оба возвращают разметку [ItemsLayoutRenderer](_items/components/ItemsLayoutRenderer.md) (страница сразу рисует каркас с фильтрами, сетку наполняет менеджер); `renderError(error)` — `h1.error` с текстом ошибки.
- `ItemsDataLoader.load()` — параллельно загружает каталог ([ItemsCacheService](../../utils/ItemsCacheService.md) `getAllItems`) и словарь синонимов поиска ([SearchTermService](../../utils/SearchTermService.md) `init`), затем читает `item` и `search` из query-строки.
- `ItemsLogic`:
  - `init(context, root)` — создаёт и инициализирует `ItemsManager` с каталогом и общим запросом; если в URL был `?item=`, сразу открывает детали предмета (`openDetail`);
  - `destroy()` — уничтожает менеджер.

## Экспорты
- `itemsSpec` — `id: 'items'`, `routes: ['/items']`, статические мета-данные «Список предметов | Backpack Insight», `logic` передаёт в `ItemsLogic` запрос и имя предмета из контекста.
- `ItemsBranch` — класс страницы; маршрут регистрирует [core.ts](../../core.md).

## Стили
Импортирует [items.scss](items.md).

## Связи
Обзор модулей страницы — [индекс библиотеки предметов](index.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
