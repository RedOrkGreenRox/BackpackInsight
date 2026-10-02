# [advanced-panel-controller.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/advanced-panel-controller.ts)

## Назначение
`AdvancedPanelController` — раскрытие и скрытие панели фильтров под строкой поиска по кнопке `#advancedFiltersToggle`. Видимость хранит [ItemsManager](../ItemsManager.md) и сохраняет между переходами ([ItemsStateManager](../ItemsStateManager.md)).

## Методы
- `init()` — вешает обработчик на кнопку и применяет сохранённое состояние (`applyInitialState`) без анимации.
- `toggle()` — переключает видимость, обновляет стрелку `.filter-toggle-icon` (▲/▼) и вызывает `saveState`.
- `show(panel, toggleBtn, wrapper)` — показывает `#advancedFiltersPanel`, через 10 мс добавляет классы `show` и `open` (для CSS-перехода), затем обновляет анимации AOS.
- `hide(panel, toggleBtn, wrapper)` — снимает классы и через 400 мс, после перехода, прячет панель, если её не открыли снова.
- `panel()`, `icon()`, `toggleBtn()`, `wrapper()` — поиск элементов внутри контейнера страницы; `wrapper` — `.search-input-wrapper`.

Стили панели — [search/_container](../../search/_container.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
