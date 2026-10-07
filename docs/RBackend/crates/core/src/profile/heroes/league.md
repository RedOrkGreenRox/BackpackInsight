# [Лига героя (league.rs)](/RBackend/crates/core/src/profile/heroes/league.rs)

## Назначение
`LeagueService` переводит рейтинг героя в лигу.

## Данные
`HERO_LEAGUES` — 11 лиг по возрастанию: Bronze, Silver, Gold, Emerald, Ruby, Sapphire, Diamond, Heroic, Epic, Legendary, Mythic.

## API
- `from_rating(rating)` — лига с индексом `rating / 500`, не больше 10: 0–499 → Bronze, 1200 → Gold, от 5000 → Mythic.
- `progress_in_tier(rating)` — остаток рейтинга внутри текущей ступени в 500 очков (1200 → 200).

## Связи
Используется в `HeroService` ([heroes/mod](mod.md)). Фронтенд показывает похожий прогресс в [hero-card](../../../../../../Frontend/ground/branches/profile/_profile/heroes/hero-card.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
