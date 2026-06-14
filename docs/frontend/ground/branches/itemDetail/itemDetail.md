# [Стили деталей предмета (itemDetail.scss)](../../../../Frontend/Web/ground/branches/itemDetail/itemDetail.scss)

## Назначение
Корневой файл стилей для страницы детального просмотра предмета.

## Связи (Dependencies)
Импортирует атомы на 1 уровень ниже:
*   [Визуальное представление](./_itemDetail/visual/_visual.md).
*   [Инфо-блоки](./_itemDetail/info/_info.md).
*   [Навигация](./_itemDetail/navigation/_navigation.md).
*   [Инфо о герое](./_itemDetail/hero-info-row/_hero-info-row.md).
*   [Статы игрока](./_itemDetail/player-stats/_player-stats.md).

## Ключевая логика
Центрирует карточку предмета и задает ей максимальную ширину для удобного чтения описаний способностей.

## AI-контекст
Именно здесь задается стиль для подсвеченных текстов способностей, которые генерирует [Парсер иконок](../../utils/icon-parser.md).
