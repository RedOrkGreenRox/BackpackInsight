# [Стили главной страницы (main.scss)](../../../../Frontend/Web/ground/branches/main/main.scss)

## Назначение
Точка сборки всех стилей главной страницы.

## Связи (Dependencies)
Импортирует компоненты на 1 уровень ниже:
*   [Стили зоны загрузки](./_main/upload-zone.md).
*   [Стили заголовка](./_main/title/styles/index.md).
*   [Стили контейнера](./_main/container/styles/index.md).
*   [Локальные анимации](./_main/animations/animations.md).

## Ключевая логика
Использует `@use` для объединения всех модулей главной страницы в единый бандл.
