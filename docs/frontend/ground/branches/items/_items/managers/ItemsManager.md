# [Оркестратор страницы предметов (ItemsManager.ts)](../../../../../../../Frontend/Web/ground/branches/items/_items/managers/ItemsManager.ts)

## Назначение
`ItemsManager` — тонкий runtime-оркестратор страницы `/items`. После декомпозиции он больше не содержит монолитную логику rich input, Fuse, AST, grid и dropdown-ов, а только соединяет подсети.

## Ключевая логика
- Восстанавливает состояние через [ItemsStateManager](ItemsStateManager.md).
- Инициализирует поисковый facade [ItemsFilterManager](ItemsFilterManager.md).
- Поднимает rich input через [rich-input-controller](runtime/rich-input-controller.md).
- Поднимает advanced panel, dropdowns, logic chips и filter chips через [runtime-подсеть](runtime/index.md).
- Рендерит выдачу через [items-grid-renderer](runtime/items-grid-renderer.md).
- Сохраняет `filteredItemsOrder` для детальной страницы предмета.

## Связи
- Search/filter engine: [filter index](filter/index.md).
- Runtime UI: [runtime index](runtime/index.md).
- Layout: [ItemsLayoutRenderer](../components/ItemsLayoutRenderer.md).

## Инварианты
- `ItemsManager.ts` не должен снова разрастаться в монолит.
- Новая UI-логика выносится в `runtime/`, новая поисковая логика — в `filter/`.
- Лимит файла — не больше 150 строк.

---

> 📌 **Подпись документации:** главный runtime-оркестратор items · 2026-06-17
