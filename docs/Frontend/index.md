# 🎨 Фронтенд — точка входа

Стартовый узел [сетевой документации](../../README.md) для клиентской части. TypeScript-SPA без фреймворка, Vite, SCSS-дизайн-система, PWA. Карусель предметов с magnetic/tilt/zoom (FE-1).

## Карта фронтенда

### Ядро и роутинг
*   [Ядро приложения (core.ts)](ground/core.md) — инициализация, регистрация маршрутов, prefetch.
*   [Генератор UI / роутер (Gen.ts)](ground/roots/Gen.md) — SPA-навигация без перезагрузки.
*   [Базовый Бранч (Branch.ts)](ground/roots/Branch.md) — жизненный цикл страниц.
*   [StructuredBranch](ground/roots/StructuredBranch.md), [BranchSpec](ground/roots/BranchSpec.md), [BranchRunner](ground/roots/BranchRunner.md).
*   [Оболочка (Shell.ts)](ground/roots/Shell.md), [Параллакс (Parallax.ts)](ground/roots/Parallax.md), [Кеш профилей (profileCacheUtils.ts)](ground/roots/profileCacheUtils.md).
*   [Базовые стили (_roots.scss)](ground/roots/_roots.md), [Shell base](ground/roots/_roots/shell_base.md), [UI navigation](ground/roots/shell/ui_navigation.md).

### Страницы (branches)
*   [Главная (MainBranch)](ground/branches/main/MainBranch.md) — загрузка/вставка JSON.
*   [Профиль (ProfileBranch)](ground/branches/profile/ProfileBranch.md).
*   [Список предметов (ItemsBranch)](ground/branches/items/ItemsBranch.md) — с каруселью (magnetic+tilt+zoom+keyboard+swipe).
*   [Детали предмета (ItemDetailBranch)](ground/branches/itemDetail/ItemDetailBranch.md).
*   [Страница 404](ground/branches/404/404.md) + [404 стили](ground/branches/404/_404/background/background_scss.md), [button_scss](ground/branches/404/_404/button/button_scss.md), [container_scss](ground/branches/404/_404/container/container_scss.md), [text_scss](ground/branches/404/_404/text/text_scss.md), [title_scss](ground/branches/404/_404/title/title_scss.md).

### Карусель (FE-1)
*   [ItemsCanvasController](ground/branches/items/_items/managers/canvas/ItemsCanvasController.md) — оркестратор.
*   [types](ground/branches/items/_items/managers/canvas/types.md), [magnetic](ground/branches/items/_items/managers/canvas/magnetic.md), [zoom](ground/branches/items/_items/managers/canvas/zoom.md), [keyboard](ground/branches/items/_items/managers/canvas/keyboard.md), [swipe](ground/branches/items/_items/managers/canvas/swipe.md), [canvas-events](ground/branches/items/_items/managers/canvas/canvas-events.md), [controller-hosts](ground/branches/items/_items/managers/canvas/controller-hosts.md).
*   [Стили карусели (_canvas.scss)](ground/branches/items/_items/canvas/_canvas.md).

### Глобальные настройки (FE-1)
*   [SettingsService](ground/utils/SettingsService.md) — singleton + localStorage.
*   [SettingsPanel (sidebar/settings.ts)](ground/roots/_roots/shell/sidebar/settings.md), [стили (_settings.scss)](ground/roots/_roots/shell/sidebar/_settings.md).

### Сервисы (utils)
*   [Сервис API (ApiService)](ground/utils/ApiService.md), [Кеш предметов (ItemsCacheService)](ground/utils/ItemsCacheService.md), [Семантический поиск (SearchTermService)](ground/utils/SearchTermService.md).
*   [Сервис слагов (SlugService)](ground/utils/SlugService.md), [Сервис иконок (ItemIconService)](ground/utils/ItemIconService.md), [Форматы изображений (ImageFormatService)](ground/utils/ImageFormatService.md), [Парсер иконок (icon-parser)](ground/utils/icon-parser.md), [Состояния загрузки (LoadingStates)](ground/utils/LoadingStates.md), [Предзагрузка (ItemPreviewPrefetchService)](ground/utils/ItemPreviewPrefetchService.md), [Meta (MetaService)](ground/utils/MetaService.md).
*   [SecurityService](ground/utils/SecurityService.md) — XSS-защита.

### Middleware + типы
*   [flatbuffer-decoders](ground/middleware/flatbuffer-decoders.md) — декодеры FlatBuffer-паков.
*   [api-types](ground/types/api-types.md), [global.d.ts](ground/types/global.md).

### Дизайн-система
*   [Переменные дизайна (_vars.scss)](ground/roots/_roots/_vars.md) — цвета редкостей, брейкпоинты.
*   [main стили](ground/branches/main/_main/upload-zone.md), [container_scss](ground/branches/main/_main/container/container_scss.md), [title_scss](ground/branches/main/_main/title/title_scss.md), [title-responsive_scss](ground/branches/main/_main/title/styles/title-responsive_scss.md).
*   [profile _image_scss](ground/branches/profile/_profile/main-heroes-grid/_image_scss.md).

### Misc
*   [package-lock](package-lock.md), [Dockerfile](Dockerfile.md), [server](server.md), [vite.config](vite.config.md), [vitest.config](vitest.config.md), [tsconfig](tsconfig.md), [index.html](index.html.md), [_headers](_headers.md).
*   [tmp/item-text-statistics](tmp/item-text-statistics.md) — артефакт анализа.

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Rust-бэкенд: [RBackend index](../RBackend/index.md).
*   Backend JSON-источники: [Backend index](../Backend/index.md).

---
> 📌 **Подпись документации:** обновлено для Rust + FE-1 карусели · 2026-07-12.
