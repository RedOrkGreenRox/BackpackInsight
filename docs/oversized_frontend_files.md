# Файлы фронтенда сверх лимита строк

Журнал по разделу 3 [REQUIREMENTS.md](../REQUIREMENTS.md): какие `.ts` и `.scss` фронтенда превышают желательный размер. Проверены каталоги `Frontend/Web/ground` и `Frontend/Web/functions`; сгенерированный flatc-код (`ground/middleware/generated/`) исключён.

Лимиты: желательно до 80 строк, пограничный — 150, крайний — 250.

## Больше 250 строк — критично (3)

```text
419  Frontend/Web/ground/branches/items/_items/managers/ItemsManager.ts
323  Frontend/Web/ground/branches/profile/_profile/managers/ProfileManager.ts
264  Frontend/Web/ground/utils/icon-parser.ts
```

## 151–250 строк — выше пограничного лимита (10)

```text
243  Frontend/Web/ground/utils/_loading-states/loading-states.scss
228  Frontend/Web/ground/utils/SearchTermService.ts
227  Frontend/Web/ground/roots/Gen.ts
205  Frontend/Web/ground/branches/profile/_profile/buttons-sort/_buttons-sort.scss
190  Frontend/Web/ground/branches/profile/_profile/sort/SortController.ts
184  Frontend/Web/ground/middleware/flatbuffer-decoders.ts
181  Frontend/Web/ground/branches/profile/_profile/managers/screenshot-manager.ts
177  Frontend/Web/ground/branches/items/_items/search/_prompt-lists.scss
170  Frontend/Web/ground/utils/ApiService.ts
165  Frontend/Web/ground/branches/main/_main/managers/validation/JsonValidator.ts
```

## 81–150 строк — выше желательных 80 строк (36)

```text
146  Frontend/Web/ground/core.ts
145  Frontend/Web/ground/branches/items/_items/managers/filter/query-parser.ts
137  Frontend/Web/ground/branches/main/_main/managers/validation/_json-validation/json-validation.scss
136  Frontend/Web/ground/branches/items/_items/managers/ItemsStateManager.ts
134  Frontend/Web/ground/roots/Shell.ts
127  Frontend/Web/ground/branches/items/_items/chips/_filter-chip.scss
126  Frontend/Web/ground/branches/items/_items/managers/runtime/rich-input-controller.ts
124  Frontend/Web/ground/branches/items/_items/managers/runtime/rich-query-renderer.ts
118  Frontend/Web/ground/branches/items/_items/managers/runtime/rich-group-renderer.ts
116  Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/ItemDetailRenderer.ts
115  Frontend/Web/ground/branches/items/_items/managers/runtime/items-grid-renderer.ts
113  Frontend/Web/ground/branches/profile/_profile/header/_stat-items-grid.scss
111  Frontend/Web/ground/branches/profile/_profile/header/header.ts
110  Frontend/Web/ground/branches/profile/_profile/header/_stat-hero-card.scss
106  Frontend/Web/ground/branches/profile/_profile/managers/ProfileDataManager.ts
105  Frontend/Web/ground/types/api-types.ts
102  Frontend/Web/ground/roots/_roots/shell/sidebar/_lang-switcher.scss
98   Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/_layout.scss
97   Frontend/Web/ground/branches/profile/_profile/main-heroes-grid/_image.scss
96   Frontend/Web/ground/utils/LoadingStates.ts
95   Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/_top-row.scss
95   Frontend/Web/ground/branches/items/_items/managers/runtime/multiselect-filter-controller.ts
94   Frontend/Web/ground/branches/items/_items/search/_container.scss
94   Frontend/Web/ground/branches/items/_items/managers/filter/alias-fuzzy.ts
93   Frontend/Web/ground/utils/ItemsCacheService.ts
93   Frontend/Web/ground/branches/items/_items/managers/runtime/items-prompt-chips-controller.ts
90   Frontend/Web/ground/branches/profile/ProfileBranch.ts
90   Frontend/Web/ground/branches/items/_items/managers/filter/search-plan.ts
89   Frontend/Web/ground/branches/items/ItemsBranch.ts
86   Frontend/Web/ground/roots/_roots/shell/sidebar/_nav-tab.scss
86   Frontend/Web/ground/branches/items/itemDetail/_itemDetail/components/ItemDetailParts.ts
86   Frontend/Web/ground/branches/items/_items/components/ItemsLayoutRenderer.ts
85   Frontend/Web/ground/roots/StructuredBranch.ts
84   Frontend/Web/ground/branches/items/_items/managers/filter/filter-options.ts
82   Frontend/Web/ground/branches/items/_items/managers/filter/item-matcher.ts
81   Frontend/Web/ground/branches/404/_404/background/background.ts
```

## Как обновить
```bash
find Frontend/Web/ground Frontend/Web/functions -type f \( -name "*.ts" -o -name "*.scss" \) \
  -not -path "*/generated/*" -exec wc -l {} + | sort -rn
```

---

> 📌 **Подпись документации:** пересчитано по дереву исходников · 2026-10-02
