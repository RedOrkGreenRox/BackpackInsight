# [Стили зоны загрузки (upload-zone.scss)](../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/upload-zone.scss)

## Назначение
Корневой файл стилей для функционального блока загрузки профиля.

## Связи (Dependencies)
Импортирует атомарные стили зоны:
*   [Базовая область](upload-zone/styles/upload-area-base.md).
*   [Текстовое поле](upload-zone/styles/upload-area-textarea.md).
*   [Базовая подсказка](upload-zone/hint-styles/upload-hint-base.md).
*   [Базовая кнопка](upload-zone/button-styles/button-base.md).
*   [Скрытые элементы](upload-zone/zone-styles/visually-hidden.md).

## Ключевая логика
*   **Состояния**: Описывает стили для состояний `.is-hovered`, `.is-loading`, `.has-error`.
*   **Эффект стекла**: Использует полупрозрачные фоны для создания эффекта "упаковки рюкзака".

## AI-контекст
Если зона загрузки перестала подсвечиваться при перетаскивании файла — проверьте селектор `.is-hovered` в этом файле.

---

> 📌 **Подпись документации:** коммит `d7d6066a23f60f9000a75b680a0de293df877ceb` (`d7d6066`) · 2026-06-15 02:31:46 +03:00 (Europe/Moscow)
