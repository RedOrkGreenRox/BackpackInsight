# [Иконки чипов фильтров (filter-icon-resolver.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/filter-icon-resolver.ts)

## Назначение
`FilterIconResolver` — иконка для чипа фильтра по значению и группе. Используется в [multiselect-filter-controller](multiselect-filter-controller.md), [items-prompt-chips-controller](items-prompt-chips-controller.md) и [ItemsManager](../ItemsManager.md).

## Методы
- `getIconForFilter(value, filterType)` — выбирает имя иконки по таблице группы: `TYPE_ICONS` (`filterTypes`), `HERO_ICONS` (`filterHeroes`), `BUFF_ICONS` (`filterBuffs`), `DEBUFF_ICONS` (`filterDebuffs`), `STAT_ICONS` (`filterStats`); для флага `Purchasable` — иконка золота. Для сортировки и неизвестных значений возвращает `null`, и чип остаётся без иконки. Тип без своей иконки пробует `generateIconsOrText` ([icon-parser](../../../../../utils/icon-parser.md)) и берёт результат, только если это картинка. Пробелы в значении при поиске типа убираются.
- `createIconHtml(iconName, title)` — `picture.filter-icon` с источниками avif и webp из `/images/fonticon` (имя в нижнем регистре), подсказкой вида «Герой: Ronan» и ленивой загрузкой.

Некоторые значения делят иконку: Cleanse — Resist, Heal — Life, Frost — Chill, Critical — CritChance.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
