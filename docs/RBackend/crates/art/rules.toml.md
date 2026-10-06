# [crates/art/rules.toml](/RBackend/crates/art/rules.toml)

## Назначение
Все поправки, которыми картинки ContentKit расходятся с экспортом предметов. Оригиналы игры не меняются никогда: следующая версия архива собирается по этим же правилам, руками дописываются только предметы, которых правила ещё не знают (`art check` называет их поимённо). Формат разбирает [rules.rs](src/rules.md).

## Разделы
- **`[sources]`** — `roots` (папки поиска: `Items`, `ui/Icons/Boons`), `states` (суффиксы состояний `Empty`/`open`/`Closed`), `cell_sizes = [60, 120]`, `aspect_tolerance = 0.08`, `default_rotate = 90`.
- **`[alias]`** — `id` → имя файла: опечатки архива (`Spike Whip`, `Fulminating Hammer`, `Bee`, `Honey`, `BeekeeperBackpack`), `Blind Bake Pie` → `Pie` и 20 благ (`boon-*` из `Season07` и `Generic`).
- **`[layers]`** — предметы из нескольких файлов (пока пусто: ограбления описаны шаблоном).
- **`[rotate]`** — явный поворот, если поворот по умолчанию неверен (пока пусто).
- **`[missing]`** — 4 предмета без картинки ни в одном ContentKit 0.36–7.0.
- **`[heist]`** — этап ограбления = свиток `Heist Plan {step}` + штамп `Heist Plan - {theme}`; `[heist.themes]` — 31 ограбление → тема.

Ключи — `id` предмета, а не `name`: у этапов ограблений `name` общий.

## Связи
- Читает [rules.rs](src/rules.md); применяет [resolve.rs](src/resolve.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
