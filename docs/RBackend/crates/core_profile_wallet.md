# core profile wallet — чтение валюты профиля без монолита

`profile/wallet/*` — маленькие корни для чтения базовой валюты профиля.

Структура:

```text
profile/wallet/types.rs   Coins, Gems, ProfileWallet, ProfileWalletInput
profile/wallet/read.rs    ProfileWalletService
profile/wallet/mod.rs     re-export
```

Назначение:

```text
не создавать old Python profile parser,
а читать базовую валюту одним маленьким доменным узлом.
```

Правила текущей контрольной точки совместимы с текущим frontend/backend:

```text
coins отсутствует -> 0
gems отсутствует -> 0
```

`core` не читает JSON напрямую. CLI строит `ProfileWalletInput` из текущего JSON-профиля.

CLI-команда:

```bash
cargo run -p cli -- profile-wallet --file ../tests/fixtures/synthetic_profile_full.json
```

---
> 📌 **Подпись документации:** profile wallet контрольная точка, 2026-07-06.
