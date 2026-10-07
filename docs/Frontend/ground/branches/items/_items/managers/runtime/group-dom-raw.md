# [Текст запроса из группы условий (group-dom-raw.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/group-dom-raw.ts)

## Назначение
Восстановление текста запроса из DOM группы условий `.rich-group` в поле расширенного поиска. Нужен, когда пользователь меняет содержимое группы прямо в поле, а сохранённый `data-raw` устаревает.

## Функции
- `groupRawFromDom(group)` — собирает `[…]` из дочерних узлов (`collectRawPart`): текст как есть, вложенные группы рекурсивно, токены (`.rich-token`) — их `data-raw` или `[значение]`, операторы (`.rich-operator`) — `data-raw` или текст, пустые слоты (`.rich-placeholder`) — маркер `slotToken()` из [rich-group-renderer](rich-group-renderer.md). Скобки-украшения (`.group-bracket`) пропускаются.
- `refreshAncestorGroups(group)` — обновляет `data-raw` у всех внешних групп.

## Потребители
`groupRawFromDom` — [rich-query-renderer](rich-query-renderer.md); `refreshAncestorGroups` — [logical-chips-controller](logical-chips-controller.md) и [ItemsManager](../ItemsManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
