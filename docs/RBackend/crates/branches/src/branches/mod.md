# [branches/branches/mod.rs](/RBackend/crates/branches/src/branches/mod.rs)

## Назначение
Ветки-страницы сайта. Каждая ветка реализует трейт `Branch` ([roots/branch.rs](../roots/branch.md)) и регистрируется в `Gen` ([roots/gen.rs](../roots/gen.md)). Аналог каталога `Frontend/Web/ground/branches` ([индекс TS-веток](/docs/Frontend/ground/branches/index.md)).

## Ключевая функциональность
| Модуль | Сборка | Путь | Ветка | Острова |
| :--- | :--- | :--- | :--- | :--- |
| [`items`](items/mod.md) | `ssr` + `hydrate` | `/items` | `ItemsBranch` | `ItemsManager` |
| [`main`](main/mod.md) | только `ssr` | `/` | `MainBranch` | — |
| [`editor`](editor/mod.md) | только `ssr` | `/editor` | `EditorBranch` | — |
| [`not_found`](not_found/mod.md) | только `ssr` | `/404` и всё неизвестное | `NotFoundBranch` | — |

`items` собирается и для WASM, потому что в нём живёт остров `ItemsManager`, его серверная функция и общая карточка. Сам `ItemsBranch` внутри `items` закрыт `#[cfg(feature = "ssr")]`. Ветки без островов в WASM не попадают вовсе.

## Как добавить ветку
1. Модуль `branches/<name>/` со структурой `<Name>Branch` и `impl Branch` (`SPEC` + `render`).
2. Строка `BranchEntry::of::<NameBranch>()` в реестре `Gen`; если страница нужна в меню — строка в `NAV` ([roots/chrome.rs](../roots/chrome.md)) и ключ перевода в `Frontend/Web/static/lang/{en,ru}.json`.
3. Маршрут Axum появится сам: `BranchRunner` строит его из `SPEC.path` ([roots/runner.rs](../roots/runner.md)).
4. Стили страницы подключаются в [site.scss](../../style/site.md) по `main[data-branch="<Name>Branch"]`.
5. Если ветке нужна интерактивность — остров (`#[island]`) в модуле, который собирается и без `ssr`, и его имя в `SPEC.islands`.

## Связи
- Корни: [roots/mod.rs](../roots/mod.md). Обзор крейта: [branches.md](../../../branches.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
