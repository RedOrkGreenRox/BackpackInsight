# [Frontend/Web/core.ts](../../../Frontend/Web/ground/core.ts)

## Назначение
Самая глубокая точка входа (Entry Point) всего фронтенд-приложения. Этот файл запускает «двигатель» **Backpack Insight**.

## Связи (Dependencies)
*   `[Shell.ts](roots/Shell.md)`: Создает экземпляр оболочки приложения.
*   `[i18n.ts](localization/i18n.md)`: Инициализирует систему переводов перед запуском интерфейса.
*   `[ui_init.ts](roots/_roots/shell/ui_init/ui_init.md)`: Вызывает базовую настройку окружения.

## Ключевая логика
Файл дожидается загрузки DOM (DOMContentLoaded) и базовых ресурсов (локализация), после чего инстанцирует `Shell` и запускает стартовую навигацию.

## AI-контекст
*   **Bootstrapping**: Если приложение не стартует вообще (белый экран), это первый файл для проверки. 
*   **Vite**: Именно этот файл указан как `main` в `package.json` или как входная точка в `index.html`.
## Класс `PerformanceMonitor`
*   `init()` — читает выбор пользователя из `localStorage` (`lowResMode`) или авто-детектит слабое устройство/сеть.
*   `toggleLowResMode(force?)` — включает/выключает режим экономии (класс `body.low-res-mode`, см. [_low-res.scss](roots/_roots/_low-res.md)).
*   Приватные: `enableMode`/`disableMode`, `isSlowConnection()` (`navigator.connection`), `isLowEndDevice()` (память/ядра).

## Логика инициализации (`DOMContentLoaded`)
*   `Promise.all([i18n.init(), ImageFormatService.init()])`, затем `AOS.init`, `Shell`/`Parallax`, регистрация маршрутов в [Gen](roots/Gen.md), prefetch по `pointerover`/`focusin`, `router.init('app')`.


---

> 📌 **Подпись документации:** коммит `d7d6066a23f60f9000a75b680a0de293df877ceb` (`d7d6066`) · 2026-06-15 02:31:46 +03:00 (Europe/Moscow)
