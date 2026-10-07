# [Типы идентичности (types.rs)](/Backend/crates/core/src/profile/identity/types.rs)

## Назначение
Типы идентичности профиля. Значения проходят очистку при создании, поэтому пустой UID или имя не могут существовать.

## Типы
- `ProfileUid(String)` — UID профиля. `new(value)` обрезает пробелы и возвращает `None` для пустой строки; `as_str`, `Display`.
- `ProfileName(String)` — видимое имя игрока; те же правила `new`/`as_str`/`Display`.
- `ProfileIdentityInput` — сырой вход: `outer_uid` (UID в корне JSON), `data_uid` (UID в секции Data), `name`.
- `ProfileIdentity` — результат: `uid` + `name`.
- `ProfileIdentityIssue` — `MissingUid` («missing UID in root or Data») и `MissingName` («missing Name»).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
