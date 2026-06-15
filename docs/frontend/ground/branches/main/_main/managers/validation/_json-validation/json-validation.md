# [Стили валидации JSON (json-validation.scss)](../../../../../../../../../Frontend/Web/ground/branches/main/_main/managers/validation/_json-validation/json-validation.scss)

## Назначение
Дизайн встроенного редактора ошибок JSON. Обеспечивает наглядную подсветку битых символов в логах игры.

## Связи (Dependencies)
*   [Валидатор JSON](../JsonValidator.md): Генерирует HTML-разметку, которую стилизует этот файл.

## Ключевая логика
*   `.error-char`: Ярко-красная подсветка конкретного неверного символа.
*   `.line-number`: Оформление колонки с номерами строк.
*   `.error-line`: Подсветка всей строки, в которой найдена ошибка.

## AI-контекст
Стиль должен быть моноширинным (`font-family: monospace`), чтобы номера строк и символы кода точно совпадали.
## Полный список селекторов
*   `.json-validation-error` — контейнер ошибки; `.validation-error-header/-footer` — шапка/подвал.
*   `.json-code`, `.code-line`, `.line-number`, `.error-line-numbers` — нумерованный код.
*   `.error-char` — подсветка битого символа; `.error-line` — подсветка строки; `.error-dismiss-btn` — крестик.
*   Цвета: `#c0392b`/`#e74c3c` (фон/рамка), `#ff6b6b` (ошибка), `#ffffff` (текст). `.low-res-mode &` — упрощение.
*   Разметку генерирует [JsonValidator](../JsonValidator.md), показывает [ErrorDisplayManager](../ErrorDisplayManager.md).


---

> 📌 **Подпись документации:** коммит `d7d6066a23f60f9000a75b680a0de293df877ceb` (`d7d6066`) · 2026-06-15 02:31:46 +03:00 (Europe/Moscow)
