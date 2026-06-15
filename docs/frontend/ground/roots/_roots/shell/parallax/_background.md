# [Фон параллакса (_background.scss)](../../../../../../../Frontend/Web/ground/roots/_roots/shell/parallax/_background.scss)

## Назначение
Стили фонового изображения `.background-image` с эффектом параллакса (двигается через `transform` из JS) и утилита блокировки скролла `.lock-scroll`.

## Задаваемые стили
### `.background-image`
*   `position:fixed; inset:0; width/height:100%; z-index:0; overflow:hidden`.
*   `transition: transform 0.12s ease-out; will-change: transform` — плавный отклик на параллакс.
### `.background-image img`
*   `position:absolute; центр через top/left:50% + translate(-50%,-50%)`.
*   `width/height:110%; transform: ... scale(1.1) ...; object-fit:cover` — запас по краям для сдвига без пустот.
*   `.low-res-mode &`: `filter:none` — отключение размытия в режиме экономии.
### `.lock-scroll`
*   `overflow:hidden!important; position:fixed; width:100%; top: calc(var(--scroll-y,0) * -1px)` — фиксирует страницу, сохраняя позицию скролла через CSS-переменную.

## Связи (Dependencies)
*   Управляется [Parallax.ts](../../../Parallax.md) (двигает `transform`) и [Shell](../../../Shell.md) (смена фоновой картинки).

## AI-контекст
*   `will-change: transform` и короткий `transition 0.12s` подобраны под частые обновления из JS. `--scroll-y` синхронизируется кодом блокировки скролла.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
