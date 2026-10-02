# [multiselect-filter-controller.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/multiselect-filter-controller.ts)

## Назначение
`MultiselectFilterController` — чипы одной категории панели фильтров. Создаёт кнопки и передаёт клики в [ItemsManager](../ItemsManager.md) через `MultiselectCallbacks`.

## `MultiselectCallbacks`
- `cycleFilter(value, groupType)` — клик по фильтру: включить → исключить → снять.
- `cycleSort(key)` — клик по чипу сортировки.
- `moveSort(key, direction)` — стрелки ▲/▼ на чипе сортировки меняют приоритет.

## Методы
- `create(containerId, options, groupType)` — очищает контейнер и создаёт кнопки: сначала значения с иконкой, затем без. В категории типов значения без иконки скрыты (класс `no-icon-extra`) за кнопкой «…» (`createMoreButton`). Вешает один обработчик на контейнер.
- `splitByIcon(options, containerId)` — делит значения по наличию иконки ([filter-icon-resolver](filter-icon-resolver.md)); у сортировки иконок нет.
- `createButton(option, containerId, groupType, hidden)` — `button.filter-chip` с `data-group-type` и `data-value`; для редкости — класс `rarity-<значение>`; показывает иконку или подпись. Чип сортировки содержит места для направления, номера приоритета и стрелок.
- `onClick(e, container)` — работает, только когда категория раскрыта (`show`); «…» переключает `show-no-icon-extra` (`toggleNoIcon`), сортировка уходит в `handleSortClick`, остальное — в `cycleFilter`.
- `handleSortClick(e, option)` — стрелка → `moveSort`, иначе `cycleSort`.

`sortKeyFromOption` переводит подпись в ключ сортировки; `sortLabel` даёт подпись: «Релевантность» через `t()` ([i18n](../../../../../localization/i18n.md)), «Алфавит» и «Редкость» зашиты по-русски.

Вид чипов после изменений обновляет [chips-sync-service](chips-sync-service.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
