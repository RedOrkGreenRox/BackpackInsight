# [Отображение ошибок (ErrorDisplayManager.ts)](../../../../../../../../Frontend/Web/ground/branches/main/_main/managers/validation/ErrorDisplayManager.ts)

## Назначение
Статический менеджер вывода ошибок в контейнер `#errorContainer`: показывает простое сообщение или детальную ошибку валидации JSON (с подсветкой), а также скрывает блок.

## Связи (Dependencies)
*   [JsonValidator](JsonValidator.md): источник результата валидации и разметки подсветки.
*   [Локализация (i18n)](../../../../../localization/i18n.md): тексты сообщений через `t()`.
*   Контейнер ошибки рендерит [ErrorRenderer (error.ts)](../../error/error.md).

## Подробное описание (реальный API, все `static`)
*   `showError(element, msg)` — показывает простое сообщение об ошибке в переданном элементе.
*   `hideError(element)` — скрывает блок ошибки.
*   `showValidationError(element, jsonText, validation, jsonValidator?)` — выводит детальную ошибку структуры JSON (номера строк, подсветка битого места).

## AI-контекст
*   Методы — `showError/hideError/showValidationError` (НЕ `clearErrors`). Принимают целевой `element` явно (без внутренней карты кодов). Тексты — только через i18n-ключи.

---

> 📌 **Подпись документации:** актуализировано линтером check_docs.py (исправлены несуществующие методы на реальный API).
