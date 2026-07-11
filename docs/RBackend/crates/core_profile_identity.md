# core profile identity — чтение имени и UID без монолита

`profile/identity/*` — маленькие корни для чтения идентичности профиля.

Структура:

```text
profile/identity/types.rs   ProfileUid, ProfileName, ProfileIdentity, ProfileIdentityInput
profile/identity/uid.rs     ProfileUidService
profile/identity/name.rs    ProfileNameService
profile/identity/mod.rs     ProfileIdentityService как тонкая сборка
```

Назначение:

```text
не создавать old Python profile parser,
а отдельно читать UID и Name как маленькие доменные значения.
```

Правила текущей контрольной точки:

```text
UID берётся из Data.UID, если он есть и не пустой
иначе UID берётся из root UID
Name должен быть непустым после trim
```

`core` не читает JSON напрямую. CLI строит `ProfileIdentityInput` из текущего JSON-профиля.

CLI-команда:

```bash
cargo run -p cli -- profile-id --file ../tests/fixtures/synthetic_profile_full.json
```

---
> 📌 **Подпись документации:** profile identity контрольная точка, 2026-07-06.
