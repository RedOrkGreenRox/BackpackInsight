# Frontend files exceeding preferred line limits

Проверены `.ts` и `.scss` в:

```text
Frontend/Web/ground
Frontend/Web/functions
```

Правило: желательно до 80 строк, край — 150, если очень нужно — 250.

## Больше 250 строк — критично

```text
339  Frontend/Web/ground/branches/items/_items/managers/ItemsManager.ts
273  Frontend/Web/ground/branches/profile/_profile/managers/ProfileManager.ts
256  Frontend/Web/ground/utils/icon-parser.ts
```

## 151–250 строк — выше крайнего желательного лимита

```text
243  Frontend/Web/ground/utils/_loading-states/loading-states.scss
228  Frontend/Web/ground/utils/SearchTermService.ts
227  Frontend/Web/ground/roots/Gen.ts
205  Frontend/Web/ground/branches/profile/_profile/buttons-sort/_buttons-sort.scss
202  Frontend/Web/functions/api/item/[id].ts
191  Frontend/Web/ground/branches/profile/_profile/sort/SortController.ts
188  Frontend/Web/ground/branches/itemDetail/_itemDetail/section/_section.scss
177  Frontend/Web/ground/branches/items/_items/search/_prompt-lists.scss
168  Frontend/Web/ground/branches/itemDetail/_itemDetail/managers/ItemDetailManager.ts
167  Frontend/Web/ground/utils/ApiService.ts
165  Frontend/Web/ground/branches/main/_main/managers/validation/JsonValidator.ts
151  Frontend/Web/ground/core.ts
```

## 81–150 строк — выше желательных 80 строк

```text
145  Frontend/Web/ground/branches/items/_items/managers/filter/query-parser.ts
142  Frontend/Web/ground/branches/itemDetail/_itemDetail/components/ItemDetailRenderer.ts
138  Frontend/Web/functions/item/[id].ts
137  Frontend/Web/ground/branches/main/_main/managers/validation/_json-validation/json-validation.scss
136  Frontend/Web/ground/branches/items/_items/managers/ItemsStateManager.ts
134  Frontend/Web/ground/roots/Shell.ts
128  Frontend/Web/ground/branches/profile/_profile/managers/screenshot-manager.ts
127  Frontend/Web/ground/branches/items/_items/chips/_filter-chip.scss
126  Frontend/Web/ground/branches/items/_items/managers/runtime/rich-input-controller.ts
124  Frontend/Web/ground/branches/items/_items/managers/runtime/rich-query-renderer.ts
118  Frontend/Web/ground/branches/items/_items/managers/runtime/rich-group-renderer.ts
113  Frontend/Web/ground/branches/profile/_profile/header/_stat-items-grid.scss
113  Frontend/Web/ground/branches/items/_items/managers/runtime/items-grid-renderer.ts
110  Frontend/Web/ground/branches/profile/_profile/header/_stat-hero-card.scss
108  Frontend/Web/ground/branches/profile/_profile/header/header.ts
106  Frontend/Web/ground/branches/profile/_profile/managers/ProfileDataManager.ts
102  Frontend/Web/ground/roots/_roots/shell/sidebar/_lang-switcher.scss
98   Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_image.scss
98   Frontend/Web/functions/api/sitemap.ts
96   Frontend/Web/ground/utils/LoadingStates.ts
95   Frontend/Web/ground/branches/items/_items/managers/runtime/multiselect-filter-controller.ts
94   Frontend/Web/ground/branches/items/_items/search/_container.scss
94   Frontend/Web/ground/branches/items/_items/managers/filter/alias-fuzzy.ts
93   Frontend/Web/ground/utils/ItemsCacheService.ts
93   Frontend/Web/ground/branches/items/ItemsBranch.ts
93   Frontend/Web/ground/branches/itemDetail/_itemDetail/navigation/_navigation.scss
90   Frontend/Web/ground/branches/items/_items/managers/filter/search-plan.ts
87   Frontend/Web/ground/branches/items/_items/components/ItemsLayoutRenderer.ts
86   Frontend/Web/ground/roots/_roots/shell/sidebar/_nav-tab.scss
84   Frontend/Web/ground/branches/items/_items/managers/filter/filter-options.ts
84   Frontend/Web/ground/branches/itemDetail/_itemDetail/managers/ItemNavigationManager.ts
82   Frontend/Web/ground/branches/items/_items/managers/filter/item-matcher.ts
81   Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_card.scss
81   Frontend/Web/ground/branches/itemDetail/_itemDetail/player-stats/_player-stats.scss
81   Frontend/Web/ground/branches/404/_404/background/background.ts
```
