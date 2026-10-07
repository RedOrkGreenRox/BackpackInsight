# [Поле расширенного поиска (rich-input-controller.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/rich-input-controller.ts)

## Назначение
`RichInputController` — поле поиска `#itemSearch` (редактируемый элемент, а не обычный input). В обычном режиме поле содержит простой текст, в расширенном — текст вперемешку с чипами условий.

## Публичные методы
- `init(initialQuery)` — заполняет поле (в расширенном режиме — HTML из [rich-query-renderer](rich-query-renderer.md)) и вешает обработчики; создаёт [raw-edit-controller](raw-edit-controller.md).
- `getInput()` — элемент поля.
- `triggerCompilation()` — превращает текущий текст в чипы, ставит каретку в конец и вызывает `onCompile`.
- `renderPlainText()` — заменяет чипы их текстом (переход в обычный режим).
- `hideAutocomplete()` — убирает подсказку [autocomplete-controller](autocomplete-controller.md).

## Обработчики
- `attachInput` — любое изменение вызывает `onQueryChange`; пустое поле прячет подсказку.
- `attachKeys` и `handleKeydown` — после ввода показывается подсказка. Enter сначала принимает подсказку (`acceptGhost`), иначе в расширенном режиме компилирует запрос, в обычном — вызывает `onCompile`. Escape прячет подсказку. Backspace в начале текстового узла удаляет предыдущий токен или оператор целиком (`handleBackspace`).
- `attachCopy` — при копировании в буфер кладётся текст запроса, а не HTML.
- `attachOutsideClick` — клик мимо чипов снимает выделение и активный слот (кроме кликов по кнопкам-шаблонам).
- `input()` — поиск поля в контейнере.

Колбэки `onQueryChange`, `onCompile` и `isAdvancedMode` передаёт [ItemsManager](../ItemsManager.md). Стили поля — [search/_input](../../search/_input.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
