# [Стили зоны загрузки (upload-zone.scss)](../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone.scss)

## Назначение
Корневой файл стилей для функционального блока загрузки профиля.

## Связи (Dependencies)
Импортирует атомарные стили зоны:
*   [Базовая область](./_main/upload-zone/styles/upload-area-base.md).
*   [Текстовое поле](./_main/upload-zone/styles/upload-area-textarea.md).
*   [Базовая подсказка](./_main/upload-zone/hint-styles/upload-hint-base.md).
*   [Базовая кнопка](./_main/upload-zone/button-styles/button-base.md).
*   [Скрытые элементы](./_main/upload-zone/zone-styles/visually-hidden.md).

## Ключевая логика
*   **Состояния**: Описывает стили для состояний `.is-hovered`, `.is-loading`, `.has-error`.
*   **Эффект стекла**: Использует полупрозрачные фоны для создания эффекта "упаковки рюкзака".

## AI-контекст
Если зона загрузки перестала подсвечиваться при перетаскивании файла — проверьте селектор `.is-hovered` в этом файле.
