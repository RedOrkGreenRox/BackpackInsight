# [Сетка героев профиля (_grid.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_grid.scss)

## Назначение
Расположение больших карточек героев `.main-heroes-grid` в основном блоке профиля + отступы секции `.section`.

## Связи (Dependencies)
*   Часть модульной сетки [_main-heroes-grid](_main-heroes-grid.md); карточки — [_card](_card.md).
*   Используется [Рендерером секции героев](../heroes/heroes-section.md).

## Задаваемые стили
### `.section`
*   `margin-top:40px; margin-bottom:40px`.
### `.main-heroes-grid`
*   `display:grid; grid-template-columns: repeat(3, 1fr); gap:10px`.
*   `width: calc(100% - 20px); max-width:1200px; margin:0 auto` (центрирование).
### Адаптив (фиксированные колонки, НЕ auto-fill)
*   `≤1100px`: `repeat(2, 1fr)`.
*   `≤600px`: `1fr` (одна колонка).

## AI-контекст
*   Количество колонок задано **явными брейкпоинтами** (3 → 2 → 1), а не `auto-fill/minmax`. Плавность перемещений при сортировке обеспечивает [SortController](../sort/SortController.md), работающий с этим гридом.

---

> 📌 **Подпись документации:** актуализировано при аудите (исправлена фактическая неточность описания стилей).
