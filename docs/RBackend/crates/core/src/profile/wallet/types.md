# [core/profile/wallet/types.rs](/RBackend/crates/core/src/profile/wallet/types.rs)

## Назначение
Типы валют профиля.

## Типы
- `Coins(u64)` — монеты; `Default` = 0, `Display` — число.
- `Gems(u64)` — гемы; то же.
- `ProfileWalletInput` — сырой вход: `coins` и `gems` как `Option<u64>`.
- `ProfileWallet` — прочитанный кошелёк: `coins` + `gems`.

Чтение — [read](read.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
