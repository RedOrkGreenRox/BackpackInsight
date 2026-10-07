# [Модель файла правил (rules.rs)](/Backend/crates/art/src/rules.rs)

## Назначение
Модель файла правил [rules.toml](../rules.toml.md) (`serde`, `deny_unknown_fields`).

## Типы
- **`Rules`** — `sources`, `alias`, `layers`, `rotate`, `missing` (все `BTreeMap` по `id`), `heist: Option<Heist>`.
- **`Sources`** — `roots`, `states`, `cell_sizes`, `aspect_tolerance`, `default_rotate`.
- **`Heist`** — шаблоны `plan` (`{step}`) и `stamp` (`{theme}`), `themes`: название ограбления → тема.

## Функции
- **`Rules::load(path)`** — чтение файла + `parse`, ошибка с путём.
- **`Rules::parse(text)`** — TOML → модель; проверяет, что каждый `rotate` равен 90, 180 или 270 и `cell_sizes` не пуст.

## Связи
- Используется в [main.rs](main.md), [resolve.rs](resolve.md), [build.rs](build.md), [check.rs](check.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
