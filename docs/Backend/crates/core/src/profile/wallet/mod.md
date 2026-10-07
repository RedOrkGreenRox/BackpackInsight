# [Кошелёк профиля (mod.rs)](/Backend/crates/core/src/profile/wallet/mod.rs)

## Назначение
Кошелёк профиля: монеты и гемы. Намеренно не разделён по валютам — это одна маленькая ответственность «прочитать базовые валюты с нулём по умолчанию».

## Подмодули
- `read` → `ProfileWalletService` — [read](read.md).
- `types` → `Coins`, `Gems`, `ProfileWallet`, `ProfileWalletInput` — [types](types.md).

## Связи
- Используется в [api/profile/view](../../../../api/src/profile/view.md). Обзор: [core_profile_wallet](../../../../core_profile_wallet.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
