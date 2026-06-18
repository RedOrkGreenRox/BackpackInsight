# [Страница 404 (NotFoundBranch.ts)](../../../../../Frontend/Web/ground/branches/404/NotFoundBranch.ts)

## Назначение

Класс `NotFoundBranch` управляет жизненным циклом страницы ошибки 404. Он реализован через [`StructuredBranch`](../../roots/StructuredBranch.md) и делегирует ответственность трём модулям:

*   **Display** — [`NotFoundDisplay`](_404/display/NotFoundDisplay.md) рендерит HTML.
*   **Data** — [`NotFoundData`](_404/data/NotFoundData.md) возвращает пустой контекст.
*   **Logic** — [`NotFoundLogic`](_404/logic/NotFoundLogic.md) управляет навигацией и фоном.

---

## Ключевая логика

### 1. Рендеринг
`NotFoundBranch` не собирает HTML самостоятельно. Он передаёт управление [`NotFoundDisplay`](_404/display/NotFoundDisplay.md), который использует атомарные рендереры:
*   [`ContainerRenderer`](_404/container/container.md)
*   [`TitleRenderer`](_404/title/title.md)
*   [`TextRenderer`](_404/text/text.md)
*   [`ButtonRenderer`](_404/button/button.md)

### 2. Жизненный цикл
`StructuredBranch` вызывает:
1. `loadData()` → [`NotFoundData`](_404/data/NotFoundData.md) (пустой контекст).
2. `renderFullPage()` → [`NotFoundDisplay`](_404/display/NotFoundDisplay.md).
3. `createLogic()` → [`NotFoundLogic`](_404/logic/NotFoundLogic.md), который инициализирует навигацию и фон.
4. При уничтожении `destroy()` — `NotFoundLogic` очищает слушатели и восстанавливает фон.

---

## AI-контекст

*   Это первая страница, мигрированная на [`StructuredBranch`](../../roots/StructuredBranch.md), и служит эталоном для остальных.
*   Вся логика, ранее находившаяся в `NotFoundBranch`, перенесена в модули с чёткими контрактами.

---

> 📌 **Подпись документации:** обновлено в рамках миграции 404 на StructuredBranch · 2026-06-18
