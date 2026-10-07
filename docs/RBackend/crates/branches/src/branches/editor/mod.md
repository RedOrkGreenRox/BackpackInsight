# [Страница «Редактор» (mod.rs)](/RBackend/crates/branches/src/branches/editor/mod.rs)

## Назначение
Корень ветки «Редактор» (`/editor`): поле рюкзака как в игре, только без магазина. Компилируется и для сервера, и для WASM: в ветке живёт остров `EditorManager`.

## Ключевая функциональность
- `pub mod kit_fn` — серверная функция набора предметов ([kit_fn.rs](kit_fn.md));
- `pub mod model` — правила поля, файл билда, запись в адресе, без браузера ([model/mod.rs](model/mod.md));
- `pub mod ui` — остров и его части ([ui/mod.rs](ui/mod.md));
- `mod branch` + `pub use branch::EditorBranch` — только под `ssr` ([branch.rs](branch.md)).

## Связи
- Регистрация ветки: [roots/gen.rs](../../roots/gen.md). Список веток: [branches/mod.rs](../mod.md).
- Требования Ивана к странице — в памяти проекта (`design-editor-page`).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
