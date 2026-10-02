# [rich-query-renderer.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/rich-query-renderer.ts)

## Назначение
`RichQueryRenderer` — перевод запроса между текстом и HTML с чипами для поля расширенного поиска. Иконки чипов получает через переданную функцию (`getIconForFilter` из [filter-icon-resolver](filter-icon-resolver.md)).

## Публичные методы
- `renderTextToRichHTML(query)` — проходит по тексту: скобки становятся токенами или группами (`consumeBracket`), `&`, `|` и `!` перед словом — операторами, `{…}` — чипом сортировки (`consumeSort`, подпись через `t()`), прочий текст копится и в нём заменяются слова И/AND, ИЛИ/OR, НЕ/NOT. Вокруг чипов ставятся пробелы, чтобы туда можно было поставить каретку.
- `compileTokenToHTML(tagText)` — `span.rich-token` для `[тег]`: классы `plain` или `exact` (для `<…>`) и `negated` (для `!`), `data-raw`, `data-value`, `data-group-type`, иконка или подпись и крестик. Стили — [search/_rich-token](../../search/_rich-token.md).
- `getCleanTextFromRichHTML(container)` — обратный перевод: текстовые узлы без символов нулевой ширины, `data-raw` чипов, группы через `groupRawFromDom` ([group-dom-raw](group-dom-raw.md)); пустые слоты пропускаются.

## Внутреннее
- `resolveGroupType(content)` — группа тега по спискам из [items-runtime-types](items-runtime-types.md) и встроенным спискам баффов, дебаффов и характеристик; иначе `plain`. Значение `sort` не возвращается, поэтому ветка подписи сортировки в `compileTokenToHTML` не срабатывает.
- `filterId(groupType)` — id категории для выбора иконки.
- `isSimpleToken(raw)` — скобка без вложений и логики. Пустым слотом здесь считается строка `__slot__`, а не маркер `()` из [rich-group-renderer](rich-group-renderer.md), поэтому скобка с одним слотом рисуется как токен, а не как группа со слотом.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
