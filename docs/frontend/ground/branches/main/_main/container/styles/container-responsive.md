# [Адаптивность контейнера (container-responsive.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/container/styles/container-responsive.scss)

## Назначение
Адаптивные переопределения `.container` (и частично `.upload-zone`) через медиа-запросы. База — в [container-base](container-base.md).

## Задаваемые стили

### `@media (max-width: 768px)`
*   `.container`: `width:98%; max-width:none; padding-top:15vh; padding-left/right:10px; font-size:1.2rem`.
*   `.container h1, .container h2`: `font-size:2.5rem`.
*   `.container p, .container div`: `line-height:1.6`.

### `@media (max-height: 600px) and (orientation: landscape)`
*   `.container`: `padding-top:5vh` — меньше верхнего отступа в альбомной ориентации низких экранов.

### `@media (max-width: 1100px)` (для `.container, .upload-zone`)
*   `width:95%; max-width:none; margin-left/right:auto` — обе зоны почти на всю ширину.

## AI-контекст
*   Только `@media`. Брейкпоинт 1100px намеренно общий для контейнера и зоны загрузки.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
