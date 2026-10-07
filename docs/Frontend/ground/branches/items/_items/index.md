# [Точка входа модуля предметов (index.ts)](../../../../../../Frontend/Web/ground/branches/items/_items/index.ts)

## Назначение
Barrel-файл внутренних модулей библиотеки предметов: реэкспортирует основные классы и типы, чтобы внешний код (например, профиль) мог импортировать их из одной точки.

## Реэкспорты
- `ItemsFilterManager` и тип `PreparedItem` — [ItemsFilterManager](managers/ItemsFilterManager.md) (поиск и фильтрация).
- `ItemsStateManager` и тип `FilterState` — [ItemsStateManager](managers/ItemsStateManager.md) (сохранение состояния фильтров).
- `ItemsManager` — [ItemsManager](managers/ItemsManager.md) (оркестратор страницы).
- `ItemsIconService` — [ItemsIconService](services/ItemsIconService.md).
- `ItemsLayoutRenderer` — [ItemsLayoutRenderer](components/ItemsLayoutRenderer.md) (разметка страницы).

Сам [ItemsBranch](../ItemsBranch.md) и [ProfileManager](../../profile/_profile/managers/ProfileManager.md) импортируют модули напрямую по путям, а не через этот индекс.

## Подсети модуля
- Поисковый движок: [managers/filter](managers/filter/index.md).
- Runtime-контроллеры UI: [managers/runtime](managers/runtime/index.md).
- Стили: поиск (`search/`), фильтры (`filters/`), чипы (`chips/`), действия (`actions/`), анимации, макет и адаптивность — см. [items.scss](../items.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
