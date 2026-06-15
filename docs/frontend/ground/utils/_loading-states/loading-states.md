# [Визуальные состояния загрузки (loading-states.scss)](../../../../../Frontend/Web/ground/utils/_loading-states/loading-states.scss)

## Назначение
Дизайн анимаций ожидания: спиннеров и мерцающих скелетонов.

## Связи (Dependencies)
*   [Состояния загрузки (TS)](../LoadingStates.md): Этот класс переключает классы, описанные здесь.

## Ключевая логика
*   `.skeleton`: Реализует эффект "бегущей волны" через градиентный фон и анимацию `shimmer`.
*   `.spinner`: Стандартный CSS-спиннер для кнопок.

## AI-контекст
Все новые компоненты, поддерживающие загрузку, должны использовать классы из этого файла для консистентности.
## Группы селекторов
*   **Скелетоны**: `.skeleton-card/-image/-content/-title/-text/-meta/-badge`, `.skeleton-profile/-header/-avatar/-info/-name/-level/-stats/-stat`.
*   **Прогресс**: `.progress-container/-bar/-fill/-label/-text`.
*   **Спиннер**: `.spinner`, `.spinner-circle`, `.spinner-small/-medium/-large`.
*   **Прочее**: `.page-loading`, `.loading-text`; `.low-res-mode &` — упрощение анимаций.
*   Генерируются методами [LoadingStates.ts](../LoadingStates.md).


---

> 📌 **Подпись документации:** коммит `d7d6066a23f60f9000a75b680a0de293df877ceb` (`d7d6066`) · 2026-06-15 02:31:46 +03:00 (Europe/Moscow)
