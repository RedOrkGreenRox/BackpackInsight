# [Переключатель выпадающего списка (_dropdown-toggle.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/filters/_dropdown-toggle.scss)

## Назначение
Стили кнопки-заголовка `.dropdown-toggle`, открывающей/закрывающей панель фильтров, и её стрелки `.dropdown-arrow`.

## Задаваемые стили

### `.dropdown-toggle`
*   Размер/раскладка: `width:100%; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; text-align:left`.
*   Фон/рамка: `background: rgba(0,0,0,0.5)`; `border:1px solid rgba(255,255,255,0.2)`; `border-radius:8px 8px 0 0`.
*   Текст: `color: var(--text-default-color)`; `font-size:1rem; font-weight:600`; `font-family:'Signika', sans-serif`; `text-shadow:0 1px 2px rgba(0,0,0,0.5)`.
*   `cursor:pointer; outline:none; transition: all 0.3s ease`.

### Состояния
*   `&:hover`: фон темнее `rgba(0,0,0,0.7)`, `border-color: var(--azure)`.
*   `&:focus`: `border-color: var(--azure)`.
*   `&.open`: `border-color: var(--azure)`, фон `rgba(0,0,0,0.7)`.

### `.dropdown-arrow`
*   `margin-left:10px; font-size:0.8rem; color: var(--azure); transition: transform 0.3s ease`.
*   `&.open .dropdown-arrow { transform: rotate(180deg); }` — стрелка переворачивается при раскрытии.
*   `span:first-child { flex:1; }` — текст занимает всё свободное место, стрелка прижата вправо.

## AI-контекст
*   Верхние скругления (`8px 8px 0 0`) согласованы с `.dropdown-content`, чтобы тоггл и панель выглядели единым блоком.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
