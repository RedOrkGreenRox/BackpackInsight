# [prepared-items.ts](/Frontend/Web/ground/branches/items/_items/managers/filter/prepared-items.ts)

## Назначение
Подготовка предметов к поиску: один раз при загрузке каталога строит для каждого предмета нормализованные тексты, чтобы поиск и фильтры не пересчитывали их на каждый ввод.

## Экспорт
- `getItemKey(item)` — ключ предмета: `id`, иначе имя.
- `prepareItems(items)` — `PreparedItem` ([filter-types](filter-types.md)) для каждого предмета: слаг имени, герой (`Hob Gang` → `Hob`, пусто → `Shared`), источник открытия, нормализованные подсказки, типы и ключи характеристик, базовый текст (id, имя, редкость, типы, герой, источник, подсказки, характеристики), расширенный текст `SearchTermService.expandText` и строгий текст. `imagePath` равен слагу, `imageSrc` пустой.
- `buildStrictText(baseText)` — токены базового текста плюс слитные формы из `STRICT_ALIASES`: если в тексте есть «melee weapon», добавляется `meleeweapon`, и наоборот; так же для крита, выносливости, здоровья и типов предметов.
- `mapPreparedByKey(prepared)` — словарь по ключу для [item-matcher](item-matcher.md) и [filter-options](filter-options.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
