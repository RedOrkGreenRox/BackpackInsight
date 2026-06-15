# [Стили фильтров (_filters.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/filters/_filters.scss)

## Назначение
Агрегатор стилей блока фильтрации предметов: флекс-контейнер кнопок фильтров с переносами на узких экранах.

## Связи (Dependencies)
Объединяет атомы фильтров:
*   [Переключатель списка](_dropdown-toggle.md), [контент выпадающего списка](_dropdown-content.md).
*   [Стили чекбоксов](../actions/_checkbox.md), [кнопка очистки](../actions/_clear-btn.md).
*   Рядом: панель [_advanced-panel](_advanced-panel.md), тоггл [_filter-toggle](_filter-toggle.md), группа [_filter-group](_filter-group.md).

## Ключевая логика
*   Флекс-контейнер для кнопок фильтров: выравнивание и `flex-wrap` для адаптивных переносов.

## AI-контекст
*   Атом-агрегатор уровня `filters/`. Цвета редкостей чипсов — в [_rarity-colors](../chips/_rarity-colors.md); адаптив — в [responsive/](../responsive/_tablet.md).

---

> 📌 **Подпись документации:** актуализировано при аудите (полнота, точность, ссылки).
