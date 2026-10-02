# [Генератор интерфейса и Роутер (Gen.ts)](/Frontend/Web/ground/roots/Gen.ts)

## Назначение
Класс `Gen` — SPA-роутер BackpackInsight: регистрирует маршруты, лениво загружает классы страниц ([Branch](Branch.md)), переключает их с анимацией и хранит позицию скролла в `history.state`.

## Публичный API
- `getInstance()` — синглтон. Конструктор приватный: включает `history.scrollRestoration = 'manual'`, слушает `popstate` (перерисовка по истории) и `scroll` (через 100 мс сохраняет `scrollY` в состояние).
- `init(containerId)` — находит контейнер приложения (иначе бросает ошибку), обрабатывает текущий URL и перехватывает клики по ссылкам `a[data-link]`: вместо перезагрузки вызывает `navigate()`, передавая `_stateData` ссылки как состояние.
- `register(path, loader)` — добавляет маршрут; `loader` — функция, возвращающая `Promise` с классом страницы (обычно динамический `import()`).
- `prefetch(path)` — заранее вызывает `loader` маршрута один раз; при ошибке путь снова становится доступен для prefetch. Наведение и касание ссылок, которые запускают prefetch, обрабатывает [core.ts](../core.md).
- `navigate(path, data?)` — игнорируется во время перехода; сохраняет текущий `scrollY`, делает `history.pushState` и запускает переход.
- `updateCurrentState(partial)` — сливает данные в `history.state` через `replaceState`.
- `reRenderCurrentBranch()` — повторно отрисовывает текущий путь с текущим состоянием (вызывается из [Shell](Shell.md) после смены языка).

## Внутренняя логика
- `findRoute(cleanPath)` — сначала точное совпадение, затем шаблоны с параметрами `:name` (сегмент декодируется и попадает в `params`).
- `handleRoute(path, data)`:
  1. увеличивает `navigationId` — защита от гонок: устаревший переход прерывается на любом шаге;
  2. для `/profile` вызывает `ProfileCacheUtils.clearCacheOnNavigation` ([profileCacheUtils](profileCacheUtils.md));
  3. неизвестный путь уходит на `/404` (или `/`); ошибка загрузки чанка — тоже на `/404`;
  4. внутренняя функция `switchBranch` размонтирует старую страницу (`unmount`), создаёт новую, обновляет мета-теги и монтирует её с данными `{ ...state, ...params }`; через 100 мс восстанавливает скролл и вызывает `AOS.refresh()`;
  5. при смене страницы контейнер получает класс `fade-out`, переключение происходит через 300 мс, а класс снимается в `requestAnimationFrame`.
- `updateMeta(meta)` — делегирует в [MetaService](../utils/MetaService.md) `updatePageMeta`.

## Связи
- Маршруты регистрирует [core.ts](../core.md); страницы на спецификациях — через [BranchRunner](BranchRunner.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
