# [items-help-controller.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/items-help-controller.ts)

## Назначение
`ItemsHelpController` — справка по расширенному поиску в `#advancedSearchHelpContent`. Синтаксис, который она описывает, разобран в [search_filter_syntax](../../../../../../../search_filter_syntax.md).

## Методы
- `renderAdvancedHelp(options)` — пишет разметку справки: обычный и расширенный режимы, умный тег `[Poison]` и точный `[<Knife>]`, операторы `!`, `&`, `|` и их русские и английские слова, группы, сравнения, теги сортировки. Шесть примеров получают кнопки «Копировать» (`.copy-query-btn` с `data-copy`). В конце — списки тегов из текущего каталога (`RuntimeFilterOptions` из [filter-options-controller](filter-options-controller.md)).
- `escapeHtml(value)`, `escapeAttr(value)` — экранирование значений и примеров.

Обработчик кнопок копирования находится в [ItemsManager](../ItemsManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
