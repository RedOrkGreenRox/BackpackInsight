# [Точка входа SPA (index.html)](../../Frontend/Web/index.html)

## Назначение
Главный HTML-шаблон одностраничного приложения: SEO-мета, Open Graph, hreflang, PWA-теги, манифест, apple-touch-иконки, контейнер `#app` и подключение точки входа `core.ts`. Серверные функции ([item/[id]](functions/item/[id].md)) патчат именно его.

## Связи (Dependencies)
*   [Ядро (core.ts)](ground/core.md) — `<script type="module" src=...>`.
*   [manifest.json](static/manifest.md), [browserconfig.xml](static/browserconfig.md), [sw.js](static/sw.md) (PWA).
*   Дефолтные мета на русском; динамическую локализацию делает SPA/функции.

## Подробное описание
*   `<head>`: title/description/keywords; OG (title/description/image/url/type/locale/site_name); canonical; hreflang ru/en/x-default.
*   PWA: `theme-color`, apple-mobile-web-app-*, msapplication-*, `<link rel=manifest>`, apple-touch-icon (72…512).
*   `<body>`: контейнер `#app` (точка монтирования роутера), подключение модульного `core.ts`.

## AI-контекст
*   Базовый язык `ru`. При SSR предмета функция [item/[id].ts](functions/item/[id].md) скачивает этот файл и инжектит мета — не ломайте структуру `<head>`/`#app`. Хешированные ассеты подключает Vite при сборке.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
