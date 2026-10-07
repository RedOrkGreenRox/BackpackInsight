# [UID профиля (uid.rs)](/Backend/crates/core/src/profile/identity/uid.rs)

## Назначение
`ProfileUidService` выбирает UID профиля.

## `read(input)`
Берёт UID из секции Data (`data_uid`); если его нет или он пустой после обрезки пробелов — UID из корня (`outer_uid`). Если оба отсутствуют — `None`. Очистку выполняет `ProfileUid::new` ([types](types.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
