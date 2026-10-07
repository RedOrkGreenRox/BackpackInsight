# 🎨 Фронтенд — точка входа

Стартовый узел [сетевой документации](../../README.md) для клиентской части. TypeScript-SPA без фреймворка, Vite, SCSS-дизайн-система, PWA.

## Карта фронтенда

### Ядро и роутинг
*   [Ядро приложения (core.ts)](ground/core.md) — инициализация, регистрация маршрутов, prefetch.
*   [Генератор UI / роутер (Gen.ts)](ground/roots/Gen.md) — SPA-навигация без перезагрузки.
*   [Базовый Бранч (Branch.ts)](ground/roots/Branch.md) — жизненный цикл страниц.
*   [StructuredBranch](ground/roots/StructuredBranch.md), [BranchSpec](ground/roots/BranchSpec.md), [BranchRunner](ground/roots/BranchRunner.md).
*   [Оболочка (Shell.ts)](ground/roots/Shell.md), [Параллакс (Parallax.ts)](ground/roots/Parallax.md), [Кеш профилей (profileCacheUtils.ts)](ground/roots/profileCacheUtils.md).
*   [Базовые стили (_roots.scss)](ground/roots/_roots.md), [Стили оболочки (_shell.scss)](ground/roots/_roots/_shell.md), [UI navigation](ground/roots/_roots/shell/sidebar/sidebar.md).

### Страницы (branches)
*   [Главная (MainBranch)](ground/branches/main/MainBranch.md) — загрузка/вставка JSON.
*   [Профиль (ProfileBranch)](ground/branches/profile/ProfileBranch.md).
*   [Список предметов (ItemsBranch)](ground/branches/items/ItemsBranch.md) — сетка, поиск и фильтры.
*   [Детали предмета (ItemDetail_Branch)](ground/branches/items/itemDetail/ItemDetail_Branch.md) — подстраница-оверлей библиотеки.
*   [Страница 404](ground/branches/404/404.md) + [404 стили](ground/branches/404/_404/background/background_scss.md), [button_scss](ground/branches/404/_404/button/button_scss.md), [container_scss](ground/branches/404/_404/container/container_scss.md), [text_scss](ground/branches/404/_404/text/text_scss.md), [title_scss](ground/branches/404/_404/title/title_scss.md).

### Библиотека предметов (items)
*   [ItemsManager](ground/branches/items/_items/managers/ItemsManager.md) — оркестратор страницы, открывает детали предмета.
*   [Фильтрация и поиск (managers/filter)](ground/branches/items/_items/managers/filter/index.md), [Runtime-контроллеры (managers/runtime)](ground/branches/items/_items/managers/runtime/index.md).
*   [Модули деталей предмета (_itemDetail)](ground/branches/items/itemDetail/_itemDetail/index.md).

### Сервисы (utils)
*   [Сервис API (ApiService)](ground/utils/ApiService.md), [Кеш предметов (ItemsCacheService)](ground/utils/ItemsCacheService.md), [Семантический поиск (SearchTermService)](ground/utils/SearchTermService.md).
*   [Сервис слагов (SlugService)](ground/utils/SlugService.md), [Сервис иконок (ItemIconService)](ground/utils/ItemIconService.md), [Форматы изображений (ImageFormatService)](ground/utils/ImageFormatService.md), [Парсер иконок (icon-parser)](ground/utils/icon-parser.md), [Состояния загрузки (LoadingStates)](ground/utils/LoadingStates.md), [Предзагрузка (ItemPreviewPrefetchService)](ground/utils/ItemPreviewPrefetchService.md), [Meta (MetaService)](ground/utils/MetaService.md).
*   [SecurityService](ground/utils/SecurityService.md) — XSS-защита.

### Middleware + типы
*   [flatbuffer-decoders](ground/middleware/flatbuffer-decoders.md) — декодеры FlatBuffer-паков.
*   [api-types](ground/types/api-types.md), [global.d.ts](ground/types/global.md).

### Дизайн-система
*   [Переменные дизайна (_vars.scss)](ground/roots/_roots/_vars.md) — цвета редкостей, брейкпоинты.
*   [main стили](ground/branches/main/_main/upload-zone/upload-zone.md), [container_scss](ground/branches/main/_main/container/container_scss.md), [title_scss](ground/branches/main/_main/title/title_scss.md), [title-responsive_scss](ground/branches/main/_main/title/styles/title-responsive.md).
*   [Портрет героя и кнопки скинов (profile _image.scss)](ground/branches/profile/_profile/main-heroes-grid/_image.md).

### Misc
*   [package-lock](package-lock.md), [browser_probe_tmp.cjs](browser_probe_tmp.md), [Dockerfile](Dockerfile.md), [server](server.md), [vite.config](vite.config.md), [vitest.config](vitest.config.md), [tsconfig](tsconfig.md), [index.html](index.html.md), [_headers](_headers.md).
*   [tmp/item-text-statistics](tmp/item-text-statistics.md) — артефакт анализа.

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Rust-бэкенд: [RBackend index](../RBackend/index.md).
*   Backend JSON-источники: [Backend index](../Backend/index.md).

## Связанные документы
*   [тесты фронтенда](tests/index.md)
*   [оптимизация картинок](scripts/optimize-images.md)
*   [концепция проекта](../readme.md)

---
> 📌 **Подпись документации:** аудит после удаления карусели и настроек, перенос itemDetail в items/ · 2026-10-02
