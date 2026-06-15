# [Вкладки навигации сайдбара (_nav-tab.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/sidebar/_nav-tab.scss)

## Назначение
Стили списка вкладок `.nav-tabs` и отдельной вкладки `.nav-tab` сайдбара: иконки, текст, hover/active с azure-подсветкой.

## Задаваемые стили
### `.nav-tabs`
*   `display:flex; flex-direction:column; width:100%; overflow-y:auto; flex-grow:1; padding:10px 0 0`.
### `.nav-tab`
*   `display:flex; align-items:center; padding: clamp(12px,2.5vh,25px) clamp(15px,3vw,30px); gap: clamp(10px,1.5vw,20px); font-size: clamp(1rem,2vmin,1.3rem)`.
*   `border-left:4px solid transparent; cursor:pointer; position:relative; transition: all 0.2s ease`.
*   Иконки `picture/img`: `width/height: clamp(32px,5vmin,40px); flex-shrink:0; object-fit:contain`.
*   `.page-title`: перенос слов (`white-space:normal; word-wrap:break-word; hyphens:none; line-height:1.2`).
*   `::before`: radial-gradient подсветка от левого края (`opacity:0`, `z-index:-1`).
### Состояния
*   `:not(.active):hover::before` и `.active::before`: `opacity:1` (подсветка).
*   `.active`: `border-left-color: var(--azure); text-shadow: 0 0 10px var(--azure)`.
*   `:hover img`: `transform: scale(1.1); filter: drop-shadow(0 0 5px var(--azure))`.

## AI-контекст
*   Активная вкладка маркируется левой azure-полосой + свечением. Подсветка фона — псевдоэлемент `::before` под контентом (`z-index:-1`), а не отдельный узел.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
