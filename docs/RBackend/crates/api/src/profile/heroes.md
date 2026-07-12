# [api/profile/heroes.rs](/RBackend/crates/api/src/profile/heroes.rs)

## Назначение
Проецирование героев из сырого игрового JSON в `ProfileHeroView`. Использует `rbackend_core::HeroService`/`HeroRating`/`Xp`.

## Ключевая функциональность
- `ProfileHeroView { name, level, rating, experience, ... }`.
- `read_heroes(json)` — парсит массив `Heroes` из входного профиля.
- Имена героев нормализуются через `HeroNameService`.

## Связи
- Вход: [json_input.rs](json_input.md).
- Ядро: [core/profile/heroes](/docs/RBackend/crates/core.md).
- Выход: [view.rs](view.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
