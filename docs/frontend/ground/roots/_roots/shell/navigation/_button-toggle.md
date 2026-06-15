# [Кнопка-бургер меню (_button-toggle.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/navigation/_button-toggle.scss)

## Назначение
Стили кнопки открытия сайдбара `.menu-toggle` (бургер) и её иконки `.toggle-icon`, включая поведение при открытом меню.

## Задаваемые стили
### `.menu-toggle`
*   `position:relative; width/height:100px; display:flex; center; overflow:hidden; padding:0`.
*   `background: rgba(0,0,0,0.4); border-radius:20px; border: var(--border)`.
*   `transition: all 0.4s cubic-bezier(0.25,0.8,0.25,1)`.
*   `picture`: контейнер на весь размер; `.toggle-icon`: `width/height:70%; object-fit:contain; transition: transform 0.4s ...`.
*   `:hover .toggle-icon`: `transform: scale(1.1)`.
### Открытое меню `body.sidebar-open .menu-toggle`
*   `pointer-events:none; transform: translateX(30px)` — кнопка уезжает; `transition: all 0.6s cubic-bezier(0.19,1,0.22,1)` синхронно с сайдбаром.

## AI-контекст
*   Анимация увода кнопки синхронизирована с раскрытием [сайдбара](../sidebar/_sidebar.md) по той же кривой Безье 0.6s.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
