# [Счёт игрока (score.rs)](/Backend/crates/core/src/profile/score.rs)

## Назначение
Чтение счёта игрока: обычные и бонусные трофеи, их сумма и игровая область.

## Типы
- `Trophy(u64)`, `BonusTrophy(u64)` — счётчики трофеев (`Default` = 0, `Display` — число).
- `ProfileScoreInput` — вход: `trophy` и `bonus_trophy` как `Option<u64>` (отсутствие = 0).
- `ProfileScore` — результат: `trophy`, `bonus_trophy`, `total_trophies` (сумма с насыщением) и `area` (`PlayerArea`, см. [types](types.md)).

## API
- `ProfileScoreService::read(input)` — заполняет `ProfileScore`, область считает [AreaService](area.md).

## Пример
5000 + 250 трофеев → сумма 5250, область `14`.

## Связи
- Используется в [api/profile/view](../../../api/src/profile/view.md). Обзор: [core_profile_score](../../../core_profile_score.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
