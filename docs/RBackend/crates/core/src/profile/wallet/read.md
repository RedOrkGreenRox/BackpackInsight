# [core/profile/wallet/read.rs](/RBackend/crates/core/src/profile/wallet/read.rs)

## Назначение
`ProfileWalletService` читает валюты профиля.

## `read(input)`
Строит `ProfileWallet` ([types](types.md)) из `ProfileWalletInput`: отсутствующие `coins` или `gems` становятся 0, каждое поле читается независимо.

## Тесты
`reads_wallet_values`, `missing_values_default_to_zero`, `can_read_only_one_side` — чтение обеих валют, нули по умолчанию, независимость полей.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
