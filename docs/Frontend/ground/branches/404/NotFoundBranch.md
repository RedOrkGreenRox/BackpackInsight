# [Страница 404 (NotFoundBranch.ts)](../../../../../Frontend/Web/ground/branches/404/NotFoundBranch.ts)

## Назначение

Файл собирает страницу ошибки 404 из спецификации `notFoundSpec` через [BranchRunner](../../roots/BranchRunner.md); экспортируемый класс `NotFoundBranch` наследует [`StructuredBranch`](../../roots/StructuredBranch.md) и делегирует ответственность трём модулям:

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

### 2. Спецификация `notFoundSpec`
*   `id: 'not-found'`, `routes: ['/404']` (маршрут регистрирует [core.ts](../../core.md); на него же [Gen](../../roots/Gen.md) уводит неизвестные пути).
*   `styles`: класс страницы `not-found-page`, класс `body` — `error-404` (по нему [Shell](../../roots/Shell.md) понимает, что открыта 404, при смене языка).
*   `meta`: заголовок и описание из ключей `not_found_meta_title` / `not_found_meta_description`.
*   `logic`: фабрика создаёт один `NotFoundLogic` на корневой элемент.

### 3. Жизненный цикл
`StructuredBranch` вызывает:
1. `data.load()` → [`NotFoundData`](_404/data/NotFoundData.md) (пустой контекст).
2. `renderFullPage()` → [`NotFoundDisplay`](_404/display/NotFoundDisplay.md).
3. `createLogic()` → [`NotFoundLogic`](_404/logic/NotFoundLogic.md), который инициализирует навигацию и фон.
4. При уничтожении `destroy()` — `NotFoundLogic` очищает слушатели и восстанавливает фон.

---

## AI-контекст

*   Эталонная страница по разделу 3.2 `ARENA.MD`: каждый визуальный элемент — отдельный мелкий рендерер со своим SCSS.

---

> 📌 **Подпись документации:** аудит по исходнику · 2026-10-02
