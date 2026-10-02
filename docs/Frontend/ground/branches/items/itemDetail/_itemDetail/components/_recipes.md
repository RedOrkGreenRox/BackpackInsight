# [Кнопка и список рецептов (_recipes.scss)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/_recipes.scss)

## Назначение
Стили раскрывающегося списка рецептов. Разметку строят `renderRecipesButton`/`renderRecipesSection` в [ItemDetailParts](ItemDetailParts.md), переключение — `setupRecipesToggle` в [ItemDetailLogic](../logic/ItemDetailLogic.md).

## Селекторы
- `.id-recipes-btn` — полоса-кнопка на всю ширину высотой 28px. При наведении и в состоянии `[aria-expanded="true"]` подсвечивается лазурным.
- `.id-recipes-arrow` — стрелка ▼ в кнопке; в раскрытом состоянии поворачивается на 180°.
- `.id-recipes` — список рецептов: верхняя граница, вертикальный flex, высота до 160px с тонким скроллбаром; `[hidden]` принудительно скрывает блок.
- `.id-recipe` — один рецепт в строку с переносом.
- `.id-recipe-arrow`, `.id-recipe-from` — приглушённые служебные символы «→» и «из:».
- `.id-recipe-result` — результат рецепта (жирный белый).
- `.id-recipe-ingredient` — ссылка на ингредиент (лазурная, подчёркивание при наведении).

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
