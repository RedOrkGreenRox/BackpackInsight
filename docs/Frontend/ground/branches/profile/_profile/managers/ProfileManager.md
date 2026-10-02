# [Оркестратор профиля (ProfileManager.ts)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/managers/ProfileManager.ts)

## Назначение
`ProfileManager` рендерит разметку профиля поверх скелетона и «оживляет» её: ошибки картинок, сортировки, поиск по инвентарю, скины, скриншот, ссылки на предметы и сохранение состояния. Создаётся в `ProfileLogic` ([ProfileBranch](../../ProfileBranch.md)).

## Публичный API
- `constructor(container, data, currentItemSort, savedState, dataManager)` — корень, данные профиля, текущая сортировка предметов, сохранённое состояние и [ProfileDataManager](ProfileDataManager.md).
- `init()` — строит поисковый индекс [ItemsFilterManager](../../../items/_items/managers/ItemsFilterManager.md) (`initFuse`) по каталогу из [ItemsCacheService](../../../../utils/ItemsCacheService.md); в `requestAnimationFrame` вставляет HTML из [ProfileLayoutRenderer](../components/ProfileLayoutRenderer.md), вызывает `attachAll`, а через 100 мс — `restoreDynamicState`.
- `destroy()` — сохраняет состояние, снимает все слушатели (`cleanupFns`), уничтожает [ScreenshotManager](screenshot-manager.md) и [SortController](../sort/SortController.md).

## Подключение поведения (`attachAll`)
- `addListener(el, event, handler, options)` — общий помощник: вешает слушатель и регистрирует его снятие.
- `attachImageErrorHandler()` — перехват `error` в фазе захвата: для `img[data-fallback]` (один раз) подставляет плейсхолдер из [ImageFormatService](../../../../utils/ImageFormatService.md) в `<img>` и все `<source>`, а родителю ставит класс `no-image`.
- `attachHeroSort()` — создаёт `SortController` для сетки героев.
- `attachItemSort()` — кнопка `#itemSortToggle` переключает `rarity` ↔ `level`, пишет выбор в `history.state` через [Gen](../../../../roots/Gen.md) `updateCurrentState`, пересортировывает и перерисовывает `#profileItemsGrid` ([item-card](../items/item-card.md)), очищает поиск и обновляет подпись `#itemSortText`.
- `attachProfileItemSearch()` — поле `#profileItemSearch`: запрос прогоняется `applyAdvancedSearch` по всему каталогу (тот же синтаксис, что в библиотеке — [синтаксис поиска](../../../../../../search_filter_syntax.md)), затем инвентарь фильтруется по совпавшим именам.
- Скины: `ProfileSkinsManager.attachSkins` ([ProfileSkinsManager](ProfileSkinsManager.md)) с колбэками:
  - `applySkinToImage(img, paths)` — гасит картинку, через 200 мс подменяет `src` и `srcset` WebP/AVIF и возвращает непрозрачность;
  - `updateHeaderSkin(heroName, skin)` — синхронизирует картинку героя в шапке (`.stat-hero-card[data-hero-name]`).
- `attachScreenshot()` — запускает `ScreenshotManager`.
- `attachItemLinks()` — каждой ссылке `.item-card-link` передаёт `_stateData = { playerItem }` (уходит в `history.state` при SPA-переходе) и сохраняет состояние при клике.
- `attachBeforeUnload()` — сохраняет состояние при закрытии/перезагрузке вкладки.

## Состояние
- `saveCurrentState()` — собирает `SavedState`: `scrollY`, сортировку предметов, сортировку героев (`getCurrentSort`/`isInverted` контроллера) и текущие скины из `data-current-skin`; пишет через [ProfileStateManager](ProfileStateManager.md).
- `restoreDynamicState()` — восстанавливает скролл, сортировку предметов (с перерисовкой сетки), сортировку героев (`applySortWithParams`) и через 200 мс скины.
- `restoreSkins(currentSkins)` — применяет сохранённый скин, только если он есть среди доступных для героя.

## Размер
Файл превышает крайний лимит строк — см. [журнал](../../../../../../oversized_frontend_files.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
