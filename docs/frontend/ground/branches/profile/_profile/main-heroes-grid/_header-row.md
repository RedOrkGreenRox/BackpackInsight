# [Шапка карточки героя (_header-row.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_header-row.scss)

## Назначение
Стили строки-шапки `.main-hero-header-row` внутри большой карточки героя (имя/уровень/рейтинг в ряд).

## Задаваемые стили
### `.main-hero-header-row`
*   `display:flex; align-items:center; justify-content:space-between; width:100%; gap:10px`.
*   `background: rgba(255,255,255,0.05); padding:10px; border-radius:15px`.
### Адаптив `≤600px`
*   `background:none; padding:0` — на мобильных подложка убирается ради компактности.

## AI-контекст
*   Часть модульной сетки [main-heroes-grid](_main-heroes-grid.md). На мобильных «карточный» фон строки намеренно отключается.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
