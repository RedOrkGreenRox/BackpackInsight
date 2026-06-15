# [Базовый контейнер главной (container-base.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/container/styles/container-base.scss)

## Назначение
Базовая геометрия центрального контейнера `.container` главной страницы. Адаптивные переопределения вынесены в [container-responsive](container-responsive.md), оба агрегируются в [index.scss](index.md).

## Задаваемые стили

### `.container`
*   Ширина: `width:100%; max-width:900px; margin:0 auto` — центрированная колонка не шире 900px.
*   Отступы: `padding: clamp(20px,5vh,60px) 20px` — адаптивный вертикальный паддинг (20–60px), фикс. горизонтальный 20px.
*   `box-sizing: border-box` — паддинги внутри ширины.
*   `position: relative; z-index: 10` — контент над фоном/параллаксом.
*   `font-size: 16px` — базовый кегль.
*   `transition: all 0.3s ease`.

## AI-контекст
*   Здесь только статичная раскладка. Все `@media` живут в `container-responsive.scss`, чтобы не смешивать слои.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
