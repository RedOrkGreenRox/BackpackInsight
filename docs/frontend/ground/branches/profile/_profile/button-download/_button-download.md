# [Стили скачивания профиля (_button-download.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/button-download/_button-download.scss)

## Назначение
Стили обёртки `.button-download-profile` и вложенной `button` (сохранение/скачивание профиля) в стиле Glass UI с azure-свечением. Соседствует с логикой [Менеджера скриншотов](../managers/screenshot-manager.md).

## Задаваемые стили

### `.container .button-download-profile` (обёртка)
*   `display:flex; justify-content:center; align-items:center`.
*   `width: fit-content; margin: 30px auto 60px auto` — по центру с вертикальными отступами.
*   `position:relative; z-index:10`.

### Вложенная `button`
*   Типографика: `font-family:'Signika'; font-weight:700; font-size:1.1rem; text-transform:uppercase; letter-spacing:0.8px; color:#fff; text-shadow:0 2px 4px rgba(0,0,0,0.9)`.
*   Геометрия: `display:flex; align-items:center; gap:10px; padding:14px 40px; border-radius:50px`.
*   Стекло: `background: rgba(0,0,0,0.5)`; `border:2px solid rgba(255,255,255,0.25)`; `box-shadow:0 5px 15px rgba(0,0,0,0.4)`; `transition: all 0.2s ease-out`.
*   `&:hover`: свечение `box-shadow:0 0 16px var(--azure)`, `transform:translateY(2px)`, подсветка рамки/фона.
*   `&:active`: `transform:translateY(4px)`, свечение слабее `0 0 8px var(--azure)`, `filter:brightness(0.9)`.
*   `span, i`: `font-style:normal; font-size:1.2em`.

### Адаптив `@media (max-width:768px)`
*   Обёртка: `margin:20px auto 40px auto`.
*   `button`: `padding:12px 30px; font-size:1rem; width:100%` (на всю ширину).

## AI-контекст
*   Hover-эффект намеренно совпадает с `.stats-heroes-grid` (azure-свечение + лёгкий сдвиг) ради единого визуального языка профиля.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
