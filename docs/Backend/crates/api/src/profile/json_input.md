# [Граница JSON профиля и core (json_input.rs)](/Backend/crates/api/src/profile/json_input.rs)

## Назначение
Граница между JSON профиля и crate core: каждая функция достаёт из `serde_json::Value` нужные поля и собирает входную структуру сервиса. Ошибок не возвращает — отсутствующее или иного типа поле становится `None`.

## Функции
| Функция | Ключи JSON | Результат |
| :--- | :--- | :--- |
| `check_input` | наличие `Data`, `Hero`, `Item`; строки `UID`, `Data.UID`, `Name` | `ProfileCheckInput` ([core/check](../../../core/src/profile/check.md)) |
| `identity_input` | `UID`, `Data.UID`, `Name` | `ProfileIdentityInput` ([core/identity](../../../core/src/profile/identity/mod.md)) |
| `wallet_input` | `Currency.coins`, `Currency.gems` как целые без знака | `ProfileWalletInput` ([core/wallet](../../../core/src/profile/wallet/mod.md)) |
| `score_input` | `Trophy`, `BonusTrophy` | `ProfileScoreInput` ([core/score](../../../core/src/profile/score.md)) |
| `unlock_values` | строки массива `UL` (нестроковые пропускаются) | список для [core/unlocks](../../../core/src/profile/unlocks/mod.md) |

`string_field(json, key)` — внутренний помощник: строковое значение ключа или `None`.

## Тесты
`extracts_profile_inputs_from_json_boundary` — все пять функций на одном образце, включая пропуск числа в `UL`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
