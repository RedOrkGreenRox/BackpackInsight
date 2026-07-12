# [api/profile/json_input.rs](/RBackend/crates/api/src/profile/json_input.rs)

## Назначение
Нормализация сырого JSON-профиля игры в типизированные `*Input` структуры ядра `rbackend_core` (`ProfileCheckInput`, `ProfileIdentityInput`, `ProfileScoreInput`, `ProfileWalletInput`).

## Ключевая функциональность
- `check_input(json)` — извлекает наличие `Data`, `UID`.
- Хелперы `string_field`, `u32_field` — безопасное чтение полей.
- Передаёт результат в `rbackend_core::ProfileCheckService` и т.п.

## Связи
- Вход для [view.rs](view.md).
- Типы ядра: [core/profile/check.rs](/docs/RBackend/crates/core_profile_check.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
