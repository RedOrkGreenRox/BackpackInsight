# 🎨 Фронтенд — точка входа

Стартовый узел [сетевой документации](../../README.md) для клиентской части. TypeScript-SPA без фреймворка, Vite, SCSS-дизайн-система, PWA.

## Карта фронтенда

### Ядро и роутинг
*   [Ядро приложения (core.ts)](ground/core.md) — инициализация, регистрация маршрутов, prefetch.
*   [Генератор UI / роутер (Gen.ts)](ground/roots/Gen.md) — SPA-навигация без перезагрузки.
*   [Базовый Бранч (Branch.ts)](ground/roots/Branch.md) — жизненный цикл страниц.
*   [Оболочка (Shell.ts)](ground/roots/Shell.md), [Кеш профилей (profileCacheUtils.ts)](ground/roots/profileCacheUtils.md).

### Страницы (branches)
*   [Главная (MainBranch)](ground/branches/main/MainBranch.md) — загрузка/вставка JSON.
*   [Профиль (ProfileBranch)](ground/branches/profile/ProfileBranch.md).
*   [Список предметов (ItemsBranch)](ground/branches/items/ItemsBranch.md).
*   [Детали предмета (ItemDetailBranch)](ground/branches/itemDetail/ItemDetailBranch.md).
*   [Страница 404](ground/branches/404/404.md).

### Сервисы (utils)
*   [Сервис API (ApiService)](ground/utils/ApiService.md), [Кеш предметов (ItemsCacheService)](ground/utils/ItemsCacheService.md), [Семантический поиск (SearchTermService)](ground/utils/SearchTermService.md).
*   [Сервис слагов (SlugService)](ground/utils/SlugService.md), [Сервис иконок (ItemIconService)](ground/utils/ItemIconService.md), [Форматы изображений (ImageFormatService)](ground/utils/ImageFormatService.md), [Парсер иконок (icon-parser)](ground/utils/icon-parser.md), [Состояния загрузки (LoadingStates)](ground/utils/LoadingStates.md), [Предзагрузка (ItemPreviewPrefetchService)](ground/utils/ItemPreviewPrefetchService.md).

### Дизайн-система
*   [Переменные дизайна (_vars.scss)](ground/roots/_roots/_vars.md) — цвета редкостей, брейкпоинты.
*   [Типы (global.d.ts)](ground/types/global.md).

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Бэкенд: [точка входа бэкенда](../backend/index.md).

---

> 📌 **Подпись документации:** создано при аудите сетевой документации как точка входа (hub-узел), обещанная в README.
