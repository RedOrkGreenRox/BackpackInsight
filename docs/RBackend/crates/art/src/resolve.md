# [Подбор файлов для картинки (resolve.rs)](/RBackend/crates/art/src/resolve.rs)

## Назначение
Какие файлы архива составляют картинку предмета. Порядок правил: `missing` → шаблон ограбления → `layers` → `alias` → файл с именем `id` → файл с именем `name`.

## Типы
- **`Resolved`** — `Art(Source)` или `Missing(причина)` из правил.
- **`Source`** — `layers` (снизу вверх), `rotate` (явный из правил), `states` (суффикс → файл; ищутся только у предметов из одного слоя: `<имя> Empty` и т. п.).
- **`Resolver::new(kit, rules)`**, **`resolve(id, name)`** — ошибка с `id`, если не подошло ни одно правило или файл слоя не найден/неоднозначен.

## Шаблон ограблений
`heist_layers` — для `id` вида `<name> I..IV`, если `name` есть в `heist.themes`: `[plan с {step}=1..4, stamp с {theme}]`. `roman_step` знает только I–IV.

## Тесты
В [resolve_tests.rs](resolve_tests.md).

## Связи
- [kit.rs](kit.md), [rules.rs](rules.md); вызывающие — [build.rs](build.md), [check.rs](check.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
