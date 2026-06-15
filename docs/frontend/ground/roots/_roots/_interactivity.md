# [Интерактивность и переходы страниц (_interactivity.scss)](../../../../../Frontend/Web/ground/roots/_roots/_interactivity.scss)

## Назначение
Глобальные правила выделения/перетаскивания элементов и анимация появления/ухода страницы через классы `body`.

## Задаваемые стили
### Запрет выделения
*   `img, span, h1, h2, h3, button, text`: `user-select:none; -webkit-user-drag:none` (UI не выделяется).
*   `.h1, .h2, .upload-area, .upload-area *`: `user-select:none; -webkit-user-drag:element`.
### Переходы страницы (на `body`)
*   `body`: `opacity:0; background:black; transition: opacity 0.5s ease-out` — стартовое скрытие.
*   `body.loaded`: `opacity:1` — проявление после загрузки.
*   `body.leaving`: `opacity:0; transition: opacity 0.3s ease-in` — затухание при уходе.

## Связи (Dependencies)
*   Классы `loaded`/`leaving` ставит [ядро (core.ts)](../../core.md) и [навигация Shell](shell/navigation/navigation.md).

## AI-контекст
*   Зона загрузки JSON переопределяет запрет выделения (см. [upload-area-user-select](../../branches/main/_main/upload-zone/styles/upload-area-user-select.md)). `body.leaving` синхронизирован с задержкой перехода функции `goTo()` из [navigation.ts](shell/navigation/navigation.md).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
