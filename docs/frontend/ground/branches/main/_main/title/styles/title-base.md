# [Базовый заголовок главной (title-base.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/title/styles/title-base.scss)

## Назначение
Базовые стили главного заголовка `.main-title` (кликабельный, с тенью/свечением и hover-эффектом). Адаптив — в [title-responsive](title-responsive.md).

## Задаваемые стили

### `.main-title`
*   Раскладка/типографика: `text-align:center; font-size:3em; margin-bottom:30px; font-weight:800; letter-spacing:1px`.
*   Цвет: `color: var(--text-default-color)`.
*   Двойная тень: `text-shadow: 0 4px 4px rgba(0,0,0,0.8)` (жёсткая вниз) + `0 0 20px rgba(0,0,0,0.5)` (мягкое свечение).
*   `cursor: pointer; transition: all 0.3s ease`.

### `&:hover`
*   Усиленная тень `0 4px 8px rgba(0,0,0,1)` + светлое свечение `0 0 25px rgba(255,255,255,0.4)`.
*   `transform: scale(1.02)`.

## AI-контекст
*   Заголовок кликабелен (`cursor:pointer`). Размеры под мобильные — в `title-responsive.scss`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
