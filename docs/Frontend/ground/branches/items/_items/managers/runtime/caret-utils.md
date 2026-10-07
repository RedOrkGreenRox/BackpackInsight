# [Работа с кареткой в поле поиска (caret-utils.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/caret-utils.ts)

## Назначение
Работа с кареткой в редактируемом поле поиска (атрибут contenteditable).

## Функции
- `moveCaretToEnd(el)` — фокус и каретка в конец элемента; без Selection API только фокус.
- `placeCaretAfter(node)` — каретка сразу после узла.
- `insertHTMLAtCaret(container, html)` — вставляет HTML на место выделения, если оно внутри контейнера, иначе в конец. Вставка обрамляется с двух сторон `span.caret-spacer` с неразрывным пробелом (`GAP_HTML`), чтобы каретку можно было поставить до и после вставленного чипа.
- `htmlToFragment(html)` — фрагмент из HTML с обрамлением и последний узел.

## Потребители
`moveCaretToEnd` — [rich-input-controller](rich-input-controller.md); `placeCaretAfter` — [raw-edit-controller](raw-edit-controller.md); `insertHTMLAtCaret` — [logical-chips-controller](logical-chips-controller.md) и [ItemsManager](../ItemsManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
