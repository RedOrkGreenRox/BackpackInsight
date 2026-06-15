# [Блок информации о предмете (_info.scss)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/info/_info.scss)

## Назначение
Стили контейнера `.item-details-info` (вертикальная компоновка блоков информации) и базового текстового класса `.text-default`.

## Задаваемые стили

### `.item-details-info`
*   `display: flex; flex-direction: column` — вертикальная колонка блоков.
*   `gap: 30px` — отступ между секциями.
*   `color: var(--text-default-color)` — базовый цвет текста из дизайн-системы.

### `.text-default`
*   `color: var(--text-default-color)`.
*   `font-size: inherit` — размер наследуется от родителя (`.wiki-stats-block`), чтобы текст в блоке статов был единого размера.

## AI-контекст
*   `font-size: inherit` критичен: он обеспечивает единый масштаб текста, задаваемый переменной `--wiki-stats-text-size` в [player-stats](../player-stats/_player-stats.md).

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
