# [rich-group-renderer.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/rich-group-renderer.ts)

## Назначение
Отрисовка групп условий `[…]` расширенного поиска в HTML и правка их исходного текста. Пустой слот в тексте обозначается маркером `()`. Стили — [search/_rich-group](../../search/_rich-group.md), [_rich-operator](../../search/_rich-operator.md), [_rich-placeholder](../../search/_rich-placeholder.md).

## Экспорт
- `slotToken()` — маркер пустого слота.
- `renderGroup(raw, compileToken)` — `span.rich-group` с исходным текстом в `data-raw` и содержимым `renderGroupInner`.
- `renderGroupInner(raw, compileToken)` — содержимое между декоративными скобками; пустая группа — слот «Выберите условие...».
- `replaceGroupSlot(raw, token)` — ставит токен в первый слот или дописывает в конец группы.
- `appendGroupOperator(raw, op)` — дописывает оператор и новый слот, если группа не пустая и не заканчивается оператором.
- `sanitizeGroupPlaceholders(query)` — убирает из запроса слоты, пустые группы и висящие операторы перед поиском ([search-plan](../filter/search-plan.md)).

## Внутреннее
- `renderContent`, `parseParts` — разбор группы на части: вложенные скобки (`parseBracket`), операторы, слоты и слова; между двумя соседними операндами вставляется неявное «и» (класс `implicit-op`).
- `isSimpleToken` — скобка без вложений и логики рисуется токеном (`compileToken`), иначе — вложенной группой.
- `wordOperator` — слова AND/И, OR/ИЛИ, NOT/НЕ.
- `operator(op, implicit)` — `span.rich-operator` с классом `op-and`, `op-or` или `op-not` и подписью `logicLabel` ([logic-labels](logic-labels.md)).
- `bracket`, `placeholder`, `unwrap`, `findMatching`, `escapeAttr` — разметка скобок и слота, снятие внешних скобок, поиск парной скобки, экранирование.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
