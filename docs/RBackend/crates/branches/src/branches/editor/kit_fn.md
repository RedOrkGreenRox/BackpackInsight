# [Серверная функция набора предметов редактора (kit_fn.rs)](/RBackend/crates/branches/src/branches/editor/kit_fn.rs)

## Назначение
Серверная функция `editor_kit(lang) -> Kit`: все предметы текущей версии игры для острова редактора одним ответом. `GET /_fn/editor_kit?lang=…`, `Cache-Control: public, max-age=300`, как у [search_fn.rs](../items/search_fn.md).

## Ключевая функциональность
- Берёт `CatalogHandle` из контекста и каталог языка ([catalog/mod.rs](../../catalog/mod.md)).
- Модуль `build` (только `ssr`): `kit(catalog)` пропускает скрытые предметы (`embargoed`) и собирает `Kit` с версией `catalog.version()`; `kit_item(item)` переносит `id`, слаг, имя, редкость и её место (`rarity_rank`), героя, типы, цену, форму и звёзды (`i8` → `i16`) и картинку из манифеста `art`.

## Связи
- Типы: [model/kit.rs](model/kit.md). Потребитель: [ui/manager.rs](ui/manager.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
