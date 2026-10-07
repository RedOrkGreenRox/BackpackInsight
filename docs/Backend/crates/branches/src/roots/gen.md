# [Реестр веток (gen.rs)](/Backend/crates/branches/src/roots/gen.rs)

## Назначение
`Gen` — реестр всех веток сайта и выбор ветки по пути запроса. Rust-версия [Gen.ts](/docs/Frontend/ground/roots/Gen.md): там выбор идёт на клиенте, здесь — на сервере при каждом SSR-рендере.

## Ключевая функциональность
- **`REGISTRY`** (приватная константа) — срез `BranchEntry` в порядке проверки: `MainBranch` (`/`), `ItemsBranch` (`/items`), `EditorBranch` (`/editor`), `NotFoundBranch` (`/404`). Новая страница добавляется одной строкой `BranchEntry::of::<NewBranch>()`.
- **`Gen::branches()`** — весь реестр. По нему [runner.rs](runner.md) регистрирует по маршруту Axum на каждую ветку.
- **`Gen::resolve(path)`** — первая ветка, чей `BranchSpec::matches` принял путь, вместе с извлечёнными `Params`. Если не подошла ни одна — `NotFoundBranch` с пустыми параметрами. Вызывается из `App` в [shell.rs](shell.md).

Порядок в реестре важен только при пересечении шаблонов: первая совпавшая ветка побеждает.

## Тесты
- `resolves_known_and_unknown_paths` — `/` → `MainBranch`, `/items` → `ItemsBranch`, `/editor` → `EditorBranch`, произвольный путь → `NotFoundBranch`.

## Связи
- Контракт ветки и запись реестра: [branch.rs](branch.md), сопоставление путей: [spec.rs](spec.md).
- Ветки: [branches/mod.rs](../branches/mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
