# [Панель advanced filters (_advanced-panel.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/filters/_advanced-panel.scss)

## Назначение
`_advanced-panel.scss` оформляет раскрываемую панель фильтров под поисковой строкой.

## Актуальная логика
- Панель визуально сливается с поисковой строкой через отрицательный `margin-top`, отсутствие верхней границы, мягкий градиент и inset-shadow.
- В открытом состоянии используется CSS Grid на две колонки, чтобы компактные категории (например логика запроса) не занимали всю ширину.
- На экранах до `768px` сетка схлопывается в одну колонку.

## Связи
- [ItemsLayoutRenderer](../components/ItemsLayoutRenderer.md) создаёт DOM панели.
- [advanced-panel-controller](../managers/runtime/advanced-panel-controller.md) управляет раскрытием.
- [filter-actions](../actions/_filter-actions.md) задаёт оформление категории логики и нижней панели действий.

---

> 📌 **Подпись документации:** advanced panel items · 2026-06-17
