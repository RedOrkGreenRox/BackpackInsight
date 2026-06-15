# [Раскладка деталей предмета (_layout.scss)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/layout/_layout.scss)

## Назначение
Стили внешнего контейнера `.item-detail-container` и карточки `.item-card-wrapper` страницы деталей предмета, включая правила выделения текста и анимацию появления.

## Задаваемые стили

### `.item-detail-container`
*   `padding:100px 20px; display:flex; justify-content:center; min-height:100vh`.
*   `* { user-select: text }` — разрешает выделение всего текста...
*   ...но навигация (`.item-navigation-top/bottom` и потомки) — `user-select: none` (кнопки не выделяются).
*   Адаптив: `≤768px` padding `80px 15px`; `≤480px` padding `60px 10px`.

### `.item-card-wrapper`
*   Стекло: `background: rgba(12,15,22,0.7)`; `border:1px solid rgba(var(--azure-raw),0.2)`; `border-radius:24px`; тень `0 15px 50px rgba(0,0,0,0.7)`.
*   Раскладка: `padding:30px; max-width:550px; width:100%; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; overflow:hidden`.
*   `animation: fadeInCard 0.5s ease-out`.
*   `&::before` — верхняя azure-полоса: `height:2px; linear-gradient(90deg, transparent, var(--azure), transparent); box-shadow: 0 0 15px 5px var(--azure)`.
*   Адаптив: `≤768px` padding 20px / radius 16px; `≤480px` padding 15px / radius 12px.

### `@keyframes fadeInCard`
*   `from`: `opacity:0; translateY(20px) scale(0.98)` → `to`: `opacity:1; translateY(0) scale(1)`.

## AI-контекст
*   Тонкий момент: текст выделяется везде, КРОМЕ навигации — это намеренно (кнопки «пред/след/назад» не должны выделяться при кликах).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
