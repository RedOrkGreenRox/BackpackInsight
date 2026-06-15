# [Кнопка-логотип сайдбара (_button-logo.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/sidebar/_button-logo.scss)

## Назначение
Стили кнопки-логотипа `.button-logo` в сайдбаре (без фона/рамки, с лёгким зумом при наведении).

## Задаваемые стили
### `.button-logo`
*   `position:relative; width/height:128px; display:flex; center; overflow:hidden; cursor:pointer`.
*   Сброс оформления: `background:none; border:none; backdrop-filter:none; box-shadow:none; animation:none`.
*   `transition: all 0.3s ease`.
*   `:hover`: `transform: scale(1.05)`.
*   `picture`: контейнер на весь размер; `.logo-icon`: `width/height:100%; object-fit:contain`.

## AI-контекст
*   Намеренно «голая» кнопка (без стекла/тени) — логотип не должен выглядеть как обычная кнопка действия.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
