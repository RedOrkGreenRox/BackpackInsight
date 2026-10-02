# [core/profile/unlocks/types.rs](/RBackend/crates/core/src/profile/unlocks/types.rs)

## Назначение
Типы разобранных разблокировок.

## Типы
- `UnlockName(String)` — непустая строка только из ASCII-букв и цифр; `new` возвращает `None` для пустой строки или строки с другими символами. `as_str`, `Display`.
- `SkinUnlock` — шаблон `{owner}Skin{skin}`: `owner` и `skin` (оба `UnlockName`).
- `BannerUnlock` — шаблон `{name}Banner…`: `name`.
- `Unlocks` — итог для фронтенда: `skins` (`BTreeMap` владелец → список кодов скинов) и `banners` (список имён).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
