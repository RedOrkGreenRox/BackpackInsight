# [Обёртка управляющих кнопок (_controls-wrapper.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/navigation/_controls-wrapper.scss)

## Назначение
Фиксированный контейнер `.controls-wrapper` в правом верхнем углу для кнопок управления (бургер и пр.), с плавным исчезновением при открытии сайдбара/уходе со страницы.

## Задаваемые стили
### `.controls-wrapper`
*   `position:fixed; top: clamp(10px,2vh,30px); right: clamp(10px,3vw,40px); left:auto; z-index:1100`.
*   `display:flex; align-items:center; gap:12px; pointer-events:none` (клики ловят только дети).
*   `transition: opacity 0.6s cubic-bezier(0.19,1,0.22,1)`.
*   `> * { pointer-events:auto }` — сами кнопки кликабельны.
*   Адаптив `≤1100px`: остаётся фикс. справа, без фона/блюра.
### Скрытие `body.sidebar-open` / `body.leaving`
*   `opacity:0; pointer-events:none` (и для детей) — кнопки исчезают синхронно с сайдбаром.

## AI-контекст
*   `pointer-events:none` на контейнере + `auto` на детях — классический приём, чтобы пустые зоны обёртки не перехватывали клики.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
