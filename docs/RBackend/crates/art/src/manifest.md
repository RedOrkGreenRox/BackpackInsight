# [art/manifest.rs](/RBackend/crates/art/src/manifest.rs)

## Назначение
`manifest.json` — единственная связь сайта с картинками: сайт берёт `id` предмета и читает отсюда пути, ничего не угадывая.

## Формат
- **`Manifest`** — `game_version`, `cell_sizes`, `items` (`id` → `ItemArt`), `missing` (`id` → причина из правил).
- **`ItemArt`** — `cells` (ширина, высота формы), `images` (размер клетки → `Encoded`), `states` (если есть), `fit` (`FitNote`), `source` (слои в архиве).
- **`FitNote`** — сериализуемая копия `Fit`: `"exact"`, `{"stretched":{"from":[w,h]}}`, `{"letterboxed":…}`.
- **`Manifest::write(out)`** — `<out>/manifest.json` с отступами (читаемый diff).

## Связи
- [encode.rs](encode.md) (`Encoded`), [render.rs](render.md) (`Fit`); читатель на сайте — [branches/catalog/art.rs](/docs/RBackend/crates/branches/src/catalog/art.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
