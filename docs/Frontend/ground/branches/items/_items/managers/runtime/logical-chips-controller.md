# [Кнопки-шаблоны логики (logical-chips-controller.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/logical-chips-controller.ts)

## Назначение
`LogicalChipsController` — кнопки-шаблоны логики (`.logical-chip`) в расширенном поиске. По клику вставляют в поле группу с пустыми слотами, которые пользователь затем заполняет условиями.

## Шаблоны (`templateFor`)
| `data-value` кнопки | Вставляется |
| :--- | :--- |
| `[]` | группа с одним слотом |
| `&` | два слота через «и» |
| `\|` | два слота через «или» |
| `!` | отрицание одного слота |

Слот — маркер `slotToken()` из [rich-group-renderer](rich-group-renderer.md).

## Куда вставляется (`onClick`)
1. Если в поле выделен токен, группа или оператор (`focusedEditable`) — шаблон заменяет его (`replaceFocused`), внешние группы обновляются (`refreshAncestorGroups`, [group-dom-raw](group-dom-raw.md)).
2. Иначе, если активен пустой слот какой-то группы (`activeGroup`), шаблон встаёт в этот слот (`replaceActiveSlot` через `replaceGroupSlot`).
3. Иначе — в позицию каретки (`insertTemplate`, `insertHTMLAtCaret` из [caret-utils](caret-utils.md)).

После вставки поле получает событие `input`, и [ItemsManager](../ItemsManager.md) перезапускает поиск. Токены внутри групп рисует [rich-query-renderer](rich-query-renderer.md).

## Прочее
`init()` вешает обработчики; `htmlToElement(html)` — первый элемент из HTML-строки.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
