# [Корневой агрегатор стилей (_roots.scss)](../../../../Frontend/Web/ground/roots/_roots.scss)

## Назначение
Главный barrel дизайн-системы: подключает все глобальные слои стилей через `@use` в строгом порядке. Импортируется в [ядре (core.ts)](../core.md) и страницах.

## Подключения (порядок = каскад)
*   `vars` ([переменные](_roots/_vars.md)) → `reset` ([сброс](_roots/_reset.md)) → `fonts` ([шрифты](_roots/_fonts.md)).
*   `error` ([.error](_roots/_error.md)) → `interactivity` ([интерактивность/переходы](_roots/_interactivity.md)) → `animations` ([анимации](_roots/_animations.md)).
*   `shell` ([оболочка](_roots/_shell.md)) → `items/items` ([стили предметов](_roots/items/_items.md)) → `low-res` ([режим экономии](_roots/_low-res.md)).
*   `../utils/_loading-states/loading-states` ([скелетоны](../utils/_loading-states/loading-states.md)).

## AI-контекст
*   Порядок критичен: `vars` первым (все используют переменные), `reset` до контентных стилей, `low-res` последним (перебивает через `!important`).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
