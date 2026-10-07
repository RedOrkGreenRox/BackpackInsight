# [Правка чипов в поле поиска (raw-edit-controller.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/raw-edit-controller.ts)

## Назначение
`RawEditController` — работа мышью и стрелками с чипами внутри поля расширенного поиска. Создаётся в [rich-input-controller](rich-input-controller.md).

## Поведение
- Клик по пустому слоту делает его активным (`activatePlaceholder`, класс `active-placeholder`) — туда встанет следующий шаблон или фильтр.
- Клик по крестику `.token-close-btn` удаляет токен (`removeToken`) и вызывает событие `input`.
- Клик по токену, группе или оператору выделяет его (`focusEditable`, класс `focused-token`).
- Двойной клик заменяет элемент его исходным текстом (`convertToRawText`: `data-raw`, `data-value` или текст) и ставит каретку после него, чтобы условие можно было править вручную.
- Стрелки влево и вправо выделяют соседний элемент, если каретка стоит в тексте рядом с ним (`onKeyup`, `getAdjacentEditable`).

## Методы
`init(richInput)` вешает обработчики `click`, `dblclick`, `keyup`; `onClick`, `onDoubleClick` распределяют события.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
