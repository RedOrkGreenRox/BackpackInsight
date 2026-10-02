# [Оркестратор страницы предметов (ItemsManager.ts)](../../../../../../../Frontend/Web/ground/branches/items/_items/managers/ItemsManager.ts)

## Назначение
`ItemsManager` — runtime-оркестратор страницы `/items`. Держит состояние фильтров и сортировки, связывает контроллеры из [runtime/](runtime/index.md) с поисковым движком [ItemsFilterManager](ItemsFilterManager.md) и открывает подстраницу деталей предмета. Создаётся в `ItemsLogic` ([ItemsBranch](../../ItemsBranch.md)).

## Публичный API
- `constructor(container, items, sharedQuery)` — корень страницы, каталог предметов и запрос из `?search=` (или `null`). Создаёт [items-grid-renderer](runtime/items-grid-renderer.md) (клик по карточке → `openDetail`) и [chips-sync-service](runtime/chips-sync-service.md).
- `init()` — `restoreState`, создание [items-url-controller](runtime/items-url-controller.md), [items-prompt-chips-controller](runtime/items-prompt-chips-controller.md), [items-help-controller](runtime/items-help-controller.md); `initFuse` по каталогу; `initRichInput`, `initPanelControls`, обработчик битых картинок ([image-error-handler](runtime/image-error-handler.md)), [dropdown-controller](runtime/dropdown-controller.md), `setupFilterOptions`, `initLogicalChips`, `applyAdvancedModeUI`, `syncAll`.
- `destroy()` — сохраняет состояние, сбрасывает дебаунсер поиска, уничтожает сетку и снимает слушатели.
- `openDetail(nameOrSlug)` — находит предмет по slug или имени, делает `pushState` на `/items?item=<slug>`, лениво импортирует [ItemDetail_Branch](../../itemDetail/ItemDetail_Branch.md), создаёт `div.item-detail-overlay` и монтирует в него подстраницу с `{ itemData, name }`. Закрытие — Esc или клик по фону.
- `closeDetail()` — если оверлей открыт, выполняет последнюю функцию очистки (размонтирование, удаление оверлея и слушателя Esc) и возвращает URL `/items` через `replaceState`.

## Состояние и инициализация
- `restoreState()` — фильтры, сортировка и флаги панели из [ItemsStateManager](ItemsStateManager.md). Если пришёл `sharedQuery`, фильтры сбрасываются, запрос подставляется, включаются продвинутый режим и панель.
- `parseSortState(raw)` — JSON-массив приоритетов сортировки или старые строковые значения (`rarity-up`, `name`, `alphabet-down`, `relevance`); иначе — значения по умолчанию.
- `ensureNegativeSets()` — гарантирует наличие всех `excluded*`-множеств.
- `saveState()` — пишет фильтры, сортировку и флаги через `ItemsStateManager`.

## Поиск и фильтры
- `initRichInput()` — [rich-input-controller](runtime/rich-input-controller.md) с колбэками `onQueryInput` (дебаунс 200 мс через [search-debouncer](runtime/search-debouncer.md)) и `onQueryCompiled` (сразу).
- `initPanelControls()` — [advanced-panel-controller](runtime/advanced-panel-controller.md), кнопка `#clearFilters`, переключатель продвинутого режима `#advancedModeToggle`, удаление чипов из списков и копирование примеров.
- `setupFilterOptions()` — опции фильтров (`calculateFilterOptions`) → [multiselect-filter-controller](runtime/multiselect-filter-controller.md) через [filter-options-controller](runtime/filter-options-controller.md); справка продвинутого режима.
- `initLogicalChips()` — [logical-chips-controller](runtime/logical-chips-controller.md) (AND/OR/NOT, группы).
- `cycleConcreteFilter(value, groupType)` — в обычном режиме цикл «включить → исключить → снять» по множествам из `setsFor`; флаг `Purchasable` циклит `purchasableOnly` (true → false → null). В продвинутом режиме вместо этого `insertTagIntoRichInput` вставляет тег `[<Tag>]` (строгий для type/rarity/hero/unlock/flag) или `[Tag]` в активный слот группы либо в позицию каретки; имя тега готовит `mappedTag`.
- `cycleSort(key)` / `moveSort(key, direction)` — меняют список приоритетов сортировки (направление вниз → вверх → удалить; сдвиг в списке).
- `afterFilterChange()` — сохранить, синхронизировать URL, применить фильтры, обновить UI.
- `applyFilters()` — конкретные фильтры → обычный или продвинутый поиск (`applyPlainTextSearch` / `applyAdvancedSearch`) → сортировка. Порядок выдачи фиксирован: релевантность, затем редкость (выбранные пользователем приоритеты в `applyFilters` не передаются). Имена результатов пишутся в `sessionStorage['filteredItemsOrder']` для навигации в [ItemDetailData](../../itemDetail/_itemDetail/data/ItemDetailData.md), затем сетка перерисовывается.
- `clearFilters()` — очищает поле, фильтры и сортировку, пересоздаёт URL-контроллер.
- `removePromptChip(e)` — удаляет значение по клику на `.prompt-token`.

## UI-синхронизация
- `syncAll()` — чипы, превью формулы, превью фильтров в URL-контроллере, списки подсказок, состояние переключателя.
- `applyAdvancedModeUI()` — класс `advanced-search-enabled`, видимость `.advanced-only` и `.prompt-lists`.
- `renderFormulaPreview()` — формула выбранных тегов с кнопкой копирования; `escapeHtml`/`escapeAttr` экранируют текст.
- `copyHelpExample(e)` — копирует `data-copy` кнопки `.copy-query-btn` и на 0.9 с меняет её подпись.
- `addListener(...)` — вешает слушатель и регистрирует его снятие.

## Размер
419 строк — выше крайнего лимита ([журнал](../../../../../../oversized_frontend_files.md)).

## Планируется
Дальнейшая декомпозиция по разделу 2.4 `ARENA.MD`: логика фильтров, сортировки и деталей предмета — в отдельные контроллеры `runtime/`, новая поисковая логика — в [filter/](filter/index.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
