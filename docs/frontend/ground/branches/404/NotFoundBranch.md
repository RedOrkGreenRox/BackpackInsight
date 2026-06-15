# [Страница 404 (NotFoundBranch.ts)](../../../../../Frontend/Web/ground/branches/404/NotFoundBranch.ts)

## Назначение
Бранч (страница) ошибки 404. Наследуется от [Branch](../../roots/Branch.md): собирает разметку из рендереров `_404`, инициализирует навигацию и «редкостный» фон, аккуратно очищает их при уходе.

## Связи (Dependencies)
*   [Базовый Бранч](../../roots/Branch.md) (`extends Branch`), [Локализация (i18n)](../../localization/i18n.md).
*   [Barrel _404](_404/index.md): `ContainerRenderer/TitleRenderer/TextRenderer/ButtonRenderer/NavigationManager`.
*   Лениво — [Менеджер фона 404](_404/background/background.md).
*   Стили: `./404.scss` ([карта стилей 404](404.md)).

## Подробное описание
*   `getMeta()` — title/description из i18n (`not_found_meta_*`).
*   `getHtml()` — собирает `Container` с подстановкой `{{CONTENT}}` = title+text+button.
*   `init()` — `isMounted=true`; сохраняет деструктор навигации; **лениво** импортирует `BackgroundManager` и ставит фон, только если `isMounted` (защита от гонки destroy↔resolve).
*   `destroy()` — `isMounted=false`; снимает навигацию; лениво восстанавливает обычный фон.

## AI-контекст
*   Порядок в `init()` (сначала навигация, потом фон) и флаг `isMounted` — намеренная защита от гонок асинхронного импорта. Фон грузится lazy, чтобы не утяжелять бандл редко открываемой страницы.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
