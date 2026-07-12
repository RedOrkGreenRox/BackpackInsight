# 📊 Данные и Механики — точка входа

Стартовый узел [сетевой документации](../../README.md) для игровых данных **Backpack Brawl**: справочники предметов, формулы опыта и логика прогрессии.

## Где лежат данные
*   **Справочники предметов**: `Backend/DB/items_*.json` (v3.1.0 → v5.1.0, `en`/`ru`) и `Backend/DB/items_tooltips.json`. См. [Backend/DB index](../Backend/DB/index.md).
*   **Сгенерированные FlatBuffer-паки**: `RBackend/generated/*.fb` (выход [builder](../RBackend/crates/build.md) crate).
*   **Профили-фикстуры для тестов**: `RBackend/tests/fixtures/profiles/*.json` (используются [regression_tests.rs](../RBackend/crates/api/src/profile/regression_tests.md)).

## Документация механик
*   **Профиль игрока**: поля, опыт, зона — см. crate [core/profile](../RBackend/crates/core.md) (`score`, `level`, `area`, `unlocks`, `wallet`, `heroes`, `items`, `identity`).
*   **Предметы**: правила XP/карточек по редкости — [core/profile/items](../RBackend/crates/core_items.md).
*   **Герои**: уровни, лиги, опыт — [core/profile/heroes](../RBackend/crates/core.md).
*   **Справочник предметов**: сборка и валидация — [builder/catalog](../RBackend/crates/build.md) + [core/catalog](../RBackend/crates/core_catalog.md).

## Синтаксис поиска
*   [Синтаксис фильтров поиска](../search_filter_syntax.md) — поддерживаемые операторы и поля (frontend, ItemsManager).

## Куда дальше
*   Общая карта проекта: [Центральный Хаб структуры](../structure.md).
*   Rust-бэкенд: [RBackend index](../RBackend/index.md).
*   Frontend: [Frontend index](../Frontend/index.md).

---
> 📌 **Подпись документации:** обновлено под Rust-бэкенд `RBackend/` · 2026-07-12.
