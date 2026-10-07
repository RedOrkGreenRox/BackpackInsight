# [Идентичность профиля (mod.rs)](/RBackend/crates/core/src/profile/identity/mod.rs)

## Назначение
Идентичность профиля: UID и отображаемое имя игрока. `ProfileIdentityService` собирает обе части и сообщает, чего не хватает.

## Подмодули
- `name` → `ProfileNameService` — [name](name.md).
- `uid` → `ProfileUidService` — [uid](uid.md).
- `types` → `ProfileIdentity`, `ProfileIdentityInput`, `ProfileIdentityIssue`, `ProfileName`, `ProfileUid` — [types](types.md).

## `ProfileIdentityService::read(input)`
Возвращает `Ok(ProfileIdentity { uid, name })`, если найдены оба значения. Иначе — `Err` со списком `ProfileIdentityIssue` (`MissingUid`, `MissingName` в этом порядке).

## Связи
- Вызывается в [api/profile/view](../../../../api/src/profile/view.md) и [api/routes/profile_binary](../../../../api/src/routes/profile_binary.md) (UID нужен для сохранения профиля в БД). Обзор: [core_profile_identity](../../../../core_profile_identity.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
