# Granularity audit — проверка дробления Rust-корня

Остановка после контрольной точки `profile-score`: проверена текущая структура `RBackend/` на чрезмерную гранулярность.

## Вывод

Основное чрезмерное дробление найдено в wallet-узле:

```text
profile/wallet/coins.rs
profile/wallet/gems.rs
```

Эти два файла содержали слишком маленькие правила (`Option<u64> -> default 0`) и имели одну общую причину изменения: чтение базовой валюты профиля.

## Исправление

Wallet-узел объединён до более сбалансированной формы:

```text
profile/wallet/types.rs   Coins, Gems, ProfileWallet, ProfileWalletInput
profile/wallet/read.rs    ProfileWalletService
profile/wallet/mod.rs     re-export
```

Удаляются отдельные сервисы:

```text
CoinsService
GemsService
```

Остаётся один маленький сервис ответственности wallet:

```text
ProfileWalletService
```

## Что оставлено как есть

Следующие узлы не считаются чрезмерными:

```text
profile/heroes/name.rs      отдельная нормализация имён
profile/heroes/level.rs     отдельная raw level/prestige/exp_need логика
profile/heroes/league.rs    отдельная rating -> league логика
profile/items/cards.rs      отдельные таблицы cards_need
profile/items/xp.rs         отдельные таблицы XP
profile/unlocks/skins.rs    отдельная грамматика skin unlocks
profile/unlocks/banners.rs  отдельная грамматика banner unlocks
profile/identity/uid.rs     UID имеет отдельное правило приоритета Data.UID
profile/identity/name.rs    Name имеет отдельное правило непустоты/trim
```

Они разделены по причинам изменения и ответственности, а не по одному полю.

---
> 📌 **Подпись документации:** аудит гранулярности `RBackend/` после первых контрольных точек, 2026-07-06.
