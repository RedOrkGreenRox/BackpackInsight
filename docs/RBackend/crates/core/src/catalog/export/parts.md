# [core/catalog/export/parts.rs](/RBackend/crates/core/src/catalog/export/parts.rs)

## Назначение
Части [`ItemDef`](item.md): клетки, рецепты, боевые статы и прокачка. У всех структур `deny_unknown_fields`, имена полей JSON в `camelCase`.

## Ключевая функциональность
- **`Cell { x: i8, y: i8 }`** — клетка относительно левого верхнего угла предмета. Звёзды бывают слева и сверху, поэтому координаты знаковые (в 5.1.0 от −6 до 7).
- **`Recipe { result_id, ingredient_ids }`** — из каких `id` собирается `resultId`.
- **`CombatStats`** — `damage_min`, `damage_max`, `accuracy`, `stamina_cost`, `cooldown`, `critical_chance`, `critical_damage`, все `Option<f64>`: `None` значит, что характеристики у предмета нет. `Default` — все `None`.
- **`Levels`** — `max_level: u8`, `chance_per_level`, `base_chance`, `chance_breakpoint_bonus` (`Option<f64>`), `ability_description: Option<String>` (описание с числами первого уровня), `changes: Vec<LevelChange>`.
- **`LevelChange`** — `level: u8`, `stat: String`, `value: f64`, `kind: Option<String>` (ключ JSON `type`; в 5.1.0 всегда `null`).

## Связи
- Модуль: [export/mod.rs](mod.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
