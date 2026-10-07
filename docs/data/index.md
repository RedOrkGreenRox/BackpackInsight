# Данные и механики, точка входа (data/)

Стартовый узел [сетевой документации](../../README.md) для игровых данных **Backpack Brawl**: справочники предметов, формулы опыта и логика прогрессии.

## Где лежат данные
*   **Справочники предметов**: `Backend/data/items_*.json` (v3.1.0 → v5.1.0, `en`/`ru`) и `Backend/data/items_tooltips.json`. См. [Backend/data index](../Backend/data/index.md).
*   **Сгенерированные FlatBuffer-паки**: `Backend/generated/*.fb` (выход [builder](../Backend/crates/build.md) crate).
*   **Профили-фикстуры для тестов**: `Backend/tests/fixtures/profiles/*.json` (используются [regression_tests.rs](../Backend/crates/api/src/profile/regression_tests.md)).

## Документация механик
*   **Профиль игрока**: поля, опыт, зона — см. crate [core/profile](../Backend/crates/core.md) (`score`, `level`, `area`, `unlocks`, `wallet`, `heroes`, `items`, `identity`).
*   **Предметы**: правила XP/карточек по редкости — [core/profile/items](../Backend/crates/core_items.md).
*   **Герои**: уровни, лиги, опыт — [core/profile/heroes](../Backend/crates/core.md).
*   **Справочник предметов**: сборка и валидация — [builder/catalog](../Backend/crates/build.md) + [core/catalog](../Backend/crates/core_catalog.md).

## Синтаксис поиска
*   [Синтаксис фильтров поиска](../search_filter_syntax.md) — поддерживаемые операторы и поля (frontend, ItemsManager).

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Rust-бэкенд: [Backend index](../Backend/index.md).
*   Frontend: [Frontend index](../Frontend/index.md).

---
> 📌 **Подпись документации:** обновлено под Rust-бэкенд `Backend/` · 2026-07-12.
