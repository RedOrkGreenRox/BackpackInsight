# [Обёртка грида героев (_stats-heroes-wrapper.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_stats-heroes-wrapper.scss)

## Назначение
Внешняя обёртка `.stats-heroes-wrapper` вокруг [грида героев](_stats-heroes-grid.md): позиционирование и адаптив ширины.

## Задаваемые стили
### `.profile-header .stats-heroes-wrapper`
*   `position:relative; z-index:2; width:100%; max-width:fit-content; margin-left:0; margin-right:auto; border-radius:10px; transition: all 0.3s cubic-bezier(...)`.
*   `:hover`: `transform: translateY(2px)`.
### Адаптив `≤480px`
*   `max-width:100%` — обёртка занимает всю ширину (1 герой в ряд вместе с гридом 2 колонок).

## AI-контекст
*   `max-width:fit-content` слева прижимает блок героев к левому краю шапки; на мобильных снимается ради полной ширины.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
