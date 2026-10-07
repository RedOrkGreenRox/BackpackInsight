# [Опыт предмета (xp.rs)](/Backend/crates/core/src/profile/items/xp.rs)

## Назначение
`ItemXpService` — суммарный опыт, который приносит предмет данного уровня (учитывается в общем опыте профиля).

## Таблицы
`COMMON_EXP`, `RARE_EXP`, `EPIC_EXP`, `LEGENDARY_EXP`, `MYTHIC_EXP` — по 15 значений; `UNIQUE_EXP` = мифическая; `RELIC_EXP` — 10 значений. Выбор — `exp_table(rarity)`.

## API
- `total_xp(rarity, level)` — сумма первых `level` значений таблицы (при уровне больше длины таблицы — сумма всей таблицы). Для `Boon` и `Special` — 0.

Пример: Common уровня 10 → 1240.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
