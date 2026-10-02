# [База rich search input (_input.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/search/_input.scss)

## Назначение
Базовые стили contenteditable-поля поиска `.search-input-rich` (элемент с id itemSearch из [ItemsLayoutRenderer](../components/ItemsLayoutRenderer.md)). Поле работает в обычном потоке строк, чтобы каретку можно было ставить между чипами.

## Правила `.search-input-rich`
- `display: block` и `white-space: pre-wrap` — inline-чипы не ломают каретку, реальные пробелы и промежутки ([caret-spacer](./_caret-spacer.md)) служат точками ввода.
- `word-break: break-word`, высота строки `2.4rem`, минимум 48px; отступы `12px 70px 12px 30px` оставляют место справа под кнопку раскрытия фильтров ([_container](./_container.md)).
- Шрифт Signika 1.15rem с лёгкой тенью, цвет `--text-default-color`.
- `:empty::before` — плейсхолдер из атрибута `placeholder` (полупрозрачный, не перехватывает клики).
- `[data-filter-query]::after` — лазурная «пилюля» с формулой выбранных фильтров после введённого текста; атрибут `data-filter-query` выставляет [items-url-controller](../managers/runtime/items-url-controller.md).

## Связи
- Элементы внутри поля: [rich-token](./_rich-token.md), [rich-group](./_rich-group.md), [rich-operator](./_rich-operator.md), [rich-placeholder](./_rich-placeholder.md).
- Поведение: [rich-input-controller](../managers/runtime/rich-input-controller.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
