# [Facade поиска и фильтрации (ItemsFilterManager.ts)](../../../../../../../Frontend/Web/ground/branches/items/_items/managers/ItemsFilterManager.ts)

## Назначение
`ItemsFilterManager` — публичный facade для поисковой подсети страницы предметов. Он сохраняет старый внешний API (`initFuse`, `applyFilters`, `sortItems`, `calculateFilterOptions`), но делегирует реализацию файлам каталога [filter/](filter/index.md).

## Ключевая логика
- `initFuse` создаёт `PreparedItem[]` через [prepared-items](filter/prepared-items.md), индекс `preparedByKey`, `ItemMatcher` и Fuse instance.
- `applyFilters` вызывает [fuse-search](filter/fuse-search.md), который разделяет free text и `[]`-условия.
- `sortItems` делегирует [sort-service](filter/sort-service.md).
- `calculateFilterOptions` делегирует [filter-options](filter/filter-options.md).

## Текущая семантика поиска
- Свободный текст вне `[]` проходит через Fuse и fuzzy alias layer.
- Простые нестрогие `[]` могут стать weighted Fuse terms.
- Exact/negated/логические/числовые условия уходят в AST matcher.
- Русские и английские операторы (`И/ИЛИ/НЕ`, `AND/OR/NOT`) нормализуются в [query-parser](filter/query-parser.md).

## Связи
- Runtime UI: [runtime index](runtime/index.md).
- Алиасы: [term-aliases.ru.json](../../../../../../../static/search/term-aliases.ru.md).

---

> 📌 **Подпись документации:** facade search/filter engine · 2026-06-17
