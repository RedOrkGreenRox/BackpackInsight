# [Части карточки предмета (ItemDetailParts.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/ItemDetailParts.ts)

## Назначение
Набор статических рендереров для отдельных блоков карточки, вынесенных из [ItemDetailRenderer](ItemDetailRenderer.md), чтобы тот оставался компактным.

## Методы
- `renderStatsList(item)` — блок `.id-stats-block` с боевыми характеристиками из `combatStats`. Возвращает пустую строку, если `combatStats` нет или все значения `null`. Раскладка:
  - строка урона `.id-stat-row-h`: `damageMin/damageMax` (отсутствующее значение — «-»);
  - строка `.id-stat-line`: точность, шанс крита (%), урон крита (%);
  - строка `.id-stat-line`: стоимость выносливости и перезарядка.
  Иконки берутся из [icon-parser](../../../../../utils/icon-parser.md) по ключам `stat_*`; заголовок — `t('item_stats_title')` с запасным «Статистика».
- `renderRecipesButton(item)` — кнопка-стрелка `.id-recipes-btn` (`aria-expanded="false"`), только если у предмета есть рецепты.
- `renderRecipesSection(item)` — скрытый (`hidden`) список `.id-recipes`: для каждого рецепта «→ результат из: ингредиенты». Каждый ингредиент — ссылка `/items?item=<slug>` с `data-link`; slug строится локально (нижний регистр, не-буквенно-цифровые символы → дефис).
- `renderPlayerInfo(playerItem?)` — блок `.id-player-stats` с уровнем (`Lvl N`) и картами `cards / cards_need`; строка карт скрыта, если `cards_need === -1`. Без `playerItem` — пусто.

## Связи
- Раскрытие рецептов обрабатывает [ItemDetailLogic](../logic/ItemDetailLogic.md).
- Стили: [_stats](_stats.md), [_recipes](_recipes.md), [_layout](_layout.md) (`.id-player-stats`, `.id-stat-row`).

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
