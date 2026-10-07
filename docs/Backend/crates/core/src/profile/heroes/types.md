# [Типы героя (types.rs)](/Backend/crates/core/src/profile/heroes/types.rs)

## Назначение
Доменные типы героя профиля.

## Типы
- `HeroName(String)` — нормализованное имя героя; `new`, `as_str`, `Display`.
- `HeroLevel(u32)` — уровень после применения правила престижа (1–20).
- `HeroRating(u32)` — очки рейтинга.
- `HeroLeague(&'static str)` — название лиги из фиксированного списка ([league](league.md)).
- `HeroInput` — сырой герой из профиля: `raw_name`, `raw_level` (с нуля), `experience` (`Xp`), `rating`.
- `Hero` — готовый герой: `name`, `level`, `experience`, `exp_need`, `rating`, `prestige`, `league`.

Все числовые обёртки реализуют `Display`; `Hero` собирается в [heroes/mod](mod.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
