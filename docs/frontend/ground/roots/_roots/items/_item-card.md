# [Карточка предмета в каталоге (_item-card.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_item-card.scss)

## Назначение
Глобальные стили карточки предмета `.item-card` (используется в сетке предметов и профиле): стекло, hover, состояния анимации появления, блок статов.

## Задаваемые стили
### `.item-card`
*   `background: rgba(30,30,30,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:15px`.
*   `display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; width:100%`.
*   `cursor:pointer; position:relative; overflow:hidden`; составной `transition` (transform/background/border/box-shadow/opacity).
*   `&.hidden`: `display:none!important` (логическое скрытие).
*   `&.preparing`: `opacity:0!important; transform: translateY(20px) scale(0.95)` (визуальное состояние перед анимацией появления).
*   `&:hover`: `translateY(-5px)`, фон `rgba(50,50,50,0.9)`, `border-color: rgba(var(--azure-raw),0.5)`, тень + azure-свечение.
### `.item-stats`
*   `display:flex; flex-direction:column; align-items:center; gap:4px; margin-top:8px`.
### Адаптив
*   `≤768px`: `padding:12px; border-radius:12px`; `≤480px`: `padding:10px; border-radius:10px`, `.item-stats` `gap:3px; margin-top:6px`.

## AI-контекст
*   Двойное состояние `hidden` (логика) и `preparing` (анимация) — намеренно: фильтрация прячет через `hidden`, плавное появление новых порций через `preparing`→снятие класса.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
