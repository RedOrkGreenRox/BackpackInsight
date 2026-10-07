# [Подписи острова редактора (labels.rs)](/RBackend/crates/branches/src/branches/editor/model/labels.rs)

## Назначение
`EditorLabels` — переведённые подписи острова редактора (пропс острова). Каждое поле берётся из словаря по ключу `editor_<поле>` в [branch.rs](../branch.md): `catalog`, `search`, `hero`, `hero_all`, `kind*`, `rarity*`, `sort*`, `more`, `inventory`, `storage` (имена поля и склада для экранных дикторов), `stash_list`, `stash_gravity` (вид склада), `info` (кнопка «i»), `resize` (ручка размера), `bag_mode`, `reset`, `import`, `export`, `apply`, `close`, `download`, `import_hint`, `import_error`, `unknown` (`{0}` — список), `loading`, `hint`.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
