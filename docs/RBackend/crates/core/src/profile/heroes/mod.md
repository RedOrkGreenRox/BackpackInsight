# [core/profile/heroes/mod.rs](/RBackend/crates/core/src/profile/heroes/mod.rs)

## Назначение
Правила героев профиля: нормализация имени, уровень с престижем, лига по рейтингу — и `HeroService`, который собирает из сырых данных готового доменного героя.

## Подмодули
- `league` → `LeagueService` — [league](league.md).
- `level` → `HeroLevelService` — [level](level.md).
- `name` → `HeroNameService` — [name](name.md).
- `types` → `Hero`, `HeroInput`, `HeroLeague`, `HeroLevel`, `HeroName`, `HeroRating` — [types](types.md).

## `HeroService::read(input)`
Из `HeroInput` (сырое имя, уровень с нуля, опыт, рейтинг) строит `Hero`:
1. имя — `HeroNameService::normalize`;
2. уровень и флаг престижа — `HeroLevelService::from_raw_level`;
3. опыт до следующего уровня — `HeroLevelService::exp_need`;
4. лига — `LeagueService::from_rating`.

Пример: `Warrior`, сырой уровень 25, рейтинг 5000 → `Ronan`, уровень 6, престиж, лига `Mythic`.

## Связи
- Вызывается в [api/profile/heroes](../../../../api/src/profile/heroes.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
