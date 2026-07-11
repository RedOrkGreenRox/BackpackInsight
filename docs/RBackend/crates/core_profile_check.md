# core profile check — базовая проверка профиля

`profile/check.rs` — маленький корень базовой проверки входного профиля.

Он не читает JSON напрямую и не знает про HTTP/БД. Он получает минимальный `ProfileCheckInput`, который может быть построен из JSON, FlatBuffer или другого входа.

Проверяет только базовую форму профиля:

```text
Data section exists
UID exists in root UID or Data.UID
Name exists and is not empty
Hero or Item section exists
```

Это замена части старого `old Python profile validation`, но без переноса имени old Python profile parser и без создания нового монолита.

CLI-команда:

```bash
cargo run -p cli -- profile-check --file ../tests/fixtures/synthetic_profile_full.json
```

---
> 📌 **Подпись документации:** profile check контрольная точка, 2026-07-06.
