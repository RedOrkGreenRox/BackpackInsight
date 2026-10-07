# [Чтение героев профиля (heroes.rs)](/Backend/crates/api/src/profile/heroes.rs)

## Назначение
Чтение героев из объекта `Hero` профиля. Значение каждого героя — строка `уровень:опыт:рейтинг`; ключ — внутреннее имя героя (например, `Warrior`).

## API
- `ProfileHeroView` — `name`, `level`, `rating`, `experience`, `exp_req`, `prestige`, `league`, `skin_num`.
- `read_heroes(json)` — все разобранные герои; если `Hero` нет или это не объект, список пустой.
- `read_hero(raw_name, raw_value)` — разбирает строку; при нечисловой или неполной строке герой пропускается (`None`). Имя, отображаемый уровень, престиж, лигу и опыт до следующего уровня считает `HeroService::read` — см. [core/heroes](../../../core/src/profile/heroes/mod.md).

`skin_num` всегда `"01"`: в JSON нет поля надетого скина, а фронтенд выбирает скин по `profile_skins` из [view](view.md). Значение только заполняет поле схемы пака.

## Тесты
- `reads_frontend_hero_view` — Warrior становится Ronan уровня 15 в лиге Diamond, Barbarian уровня 25 — Harkon уровня 6 с престижем в лиге Mythic.
- `skips_malformed_heroes` — строка `bad` отбрасывается.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
