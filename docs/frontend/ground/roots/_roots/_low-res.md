# [Режим экономии ресурсов (_low-res.scss)](../../../../../Frontend/Web/ground/roots/_roots/_low-res.scss)

## Назначение
Стили режима производительности: при классе `body.low-res-mode` отключает анимации, блюр, тени и параллакс ради экономии CPU/GPU на слабых устройствах.

## Задаваемые стили (внутри `body.low-res-mode`)
*   **Анимации**: `*, *::before, *::after { transition:none!important; animation:none!important; will-change:auto!important }`.
*   **Блюр**: `.sidebar, .sidebar-overlay` — `backdrop-filter:none!important`, плотный фон `rgba(0,0,0,0.85)`.
*   **Тени**: убраны у `.item-card:hover`, `.load-more-btn:hover`; `text-shadow:none` у `.nav-tab.active`.
*   **Параллакс**: `#parallax-container { display:none!important }`.
*   **Transform-ховеры**: отключены у `.item-card:hover` и `.nav-tab:hover img` (+ `filter:none`).

## Связи (Dependencies)
*   Класс `low-res-mode` переключает `PerformanceMonitor` в [ядре (core.ts)](../../core.md) (авто-детект слабого устройства/медленной сети или выбор пользователя).

## AI-контекст
*   Все правила через `!important` — намеренно, чтобы гарантированно перебить обычные стили. Добавляя ресурсоёмкий эффект в проект, продумайте его отключение здесь.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
