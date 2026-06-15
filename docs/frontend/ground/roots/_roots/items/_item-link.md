# [Ссылка-обёртка карточки (_item-link.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_item-link.scss)

## Назначение
Стили кликабельной обёртки `.item-card-link` вокруг карточки предмета с оптимизацией рендеринга.

## Задаваемые стили
### `.item-card-link`
*   `display:block; text-decoration:none; color:inherit; cursor:pointer; position:relative; z-index:1; height:100%`.
*   Производительность: `content-visibility:auto; contain-intrinsic-size: 190px 170px` — отложенный рендер вне вьюпорта с зарезервированным размером.
*   `-webkit-tap-highlight-color: transparent`; `&:focus { outline:none }`.
*   `&.hidden { display:none!important }`.

## AI-контекст
*   `content-visibility:auto` существенно ускоряет длинные списки предметов; `contain-intrinsic-size` задаёт «заглушку» размера, чтобы не прыгал скролл. Не убирайте без замера производительности.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
