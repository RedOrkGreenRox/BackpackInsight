# [core/profile/identity/name.rs](/RBackend/crates/core/src/profile/identity/name.rs)

## Назначение
`ProfileNameService` читает отображаемое имя игрока.

## `read(input)`
Возвращает `ProfileName` из поля `name` с обрезанными пробелами; пустое или пробельное имя — `None` (см. `ProfileName::new` в [types](types.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
