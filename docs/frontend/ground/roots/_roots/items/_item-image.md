# [Изображение предмета в карточке (_item-image.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_item-image.scss)

## Назначение
Стили обёртки `.item-image-wrapper`, иконки `.item-icon` и плейсхолдера «нет изображения».

## Задаваемые стили
### `.item-image-wrapper`
*   `width:100%; aspect-ratio:1; display:flex; center; margin-bottom:10px` (квадратный контейнер).
*   `picture`: контейнер на весь размер.
### `.item-icon`
*   `max-width/height:100%; object-fit:contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); transition: transform 0.3s ease`.
*   `.item-card:hover .item-icon`: `transform: scale(1.1)`.
### `.item-image-wrapper.no-image .item-icon`
*   `opacity:0.5; filter: grayscale(1)` — плейсхолдер блёклый и ч/б.

## AI-контекст
*   `aspect-ratio:1` держит сетку ровной независимо от пропорций иконки. Класс `no-image` навешивается, когда картинка не найдена.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
