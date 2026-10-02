# [Сетка формы предмета (ItemGridRenderer.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/ItemGridRenderer.ts)

## Назначение
Рисует форму предмета в рюкзаке: клетки `itemShape`, звёзды `itemStars` и иконку предмета поверх сетки. Результат вставляется в левую колонку карточки [ItemDetailRenderer](ItemDetailRenderer.md).

## Методы
- `render(item)`:
  - путь к иконке — [ItemIconService](../../../../../utils/ItemIconService.md) `getImagePath()` + [ImageFormatService](../../../../../utils/ImageFormatService.md) `itemSrc()`;
  - если нет ни клеток, ни звёзд — только картинка в `.id-grid-empty`;
  - иначе считает границы, строит CSS-grid нужного размера (`aspect-ratio` = столбцы/строки) и для каждой позиции выводит `.id-grid-cell` (с классом `filled`, если клетка входит в форму). Ось Y инвертируется: больший `y` рисуется выше. Звёзды кладутся отдельным слоем `.id-grid-star`, иконка `.id-grid-icon` растягивается на всю сетку.
- `starIcon()` (приватный) — `<img class="id-grid-star-icon">` с иконкой `star` через `ImageFormatService.iconSrc()`.
- `bounds(shape, stars)` (приватный) — минимальные/максимальные `x`/`y` по клеткам и звёздам. Начальные значения равны 0, поэтому точка (0,0) всегда входит в границы.

Все `<img>` помечены `data-fallback` для глобального обработчика битых изображений из [ui_init](../../../../../roots/_roots/shell/ui_init/ui_init.md).

## Стили
[_grid](_grid.md).

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
