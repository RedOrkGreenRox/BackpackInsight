# [Логика деталей предмета (ItemDetailLogic.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/logic/ItemDetailLogic.ts)

## Назначение
`ItemDetailLogic` реализует `BranchLogic` из [StructuredBranch](../../../../../roots/StructuredBranch.md): навешивает поведение на уже отрисованную разметку и полностью снимает его при закрытии подстраницы.

## API
- `constructor(root)` — запоминает корневой элемент подстраницы.
- `init(context)` — если `context.itemData` пуст (предмет не найден), ничего не делает. Иначе:
  - создаёт [ItemSEOManager](../managers/ItemSEOManager.md) и вызывает `update(itemData, isProfile)`, где `isProfile = !!context.playerItem`;
  - подключает обработчик копирования (`setupCopyHandler`);
  - подключает раскрытие рецептов (`setupRecipesToggle`).
- `destroy()` — выполняет все функции очистки, затем `seoManager.restore()` (возврат `document.title`) и `seoManager.cleanup()` (удаление JSON-LD).

## Приватные методы
- `setupCopyHandler(root)` — слушает `copy` на корне. Копирует выделение во временный `div`, заменяет каждую иконку `<img>`/`<picture>` на текст `[alt]` (или `[title]`) и кладёт в буфер обмена `text/plain` и `text/html`. Так скопированное описание предмета остаётся читаемым без картинок.
- `setupRecipesToggle(root)` — по клику на `.id-recipes-btn` переключает `aria-expanded` и атрибут `hidden` у `.id-recipes`. Разметку кнопки и секции строит [ItemDetailParts](../components/ItemDetailParts.md).

Все слушатели регистрируются вместе с функцией снятия в `cleanupFns`.

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
