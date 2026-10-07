# [Картинки предметов (art.rs)](/Backend/crates/branches/src/catalog/art.rs)

## Назначение
Картинки предметов из `Frontend/Web/static/images/art/manifest.json`, который пишет крейт [art](/docs/Backend/crates/art/src/main.md) (`art build`). Картинка ищется по `id` предмета — без угадывания имён файлов. Предмета нет в манифесте — карточка покажет заглушку.

## API
- **`ART_DIR`** = `"art"` — папка внутри `/images` и `Frontend/Web/static/images`.
- **`ArtIndex::load(path)`** — читает манифест (нужны только `items.<id>.images.<cell>.avif` и необязательные `items.<id>.states.<состояние>.<cell>.avif`); ошибка, если файла нет или он не разбирается.
- **`ArtIndex::get(id)`** — `ItemImage` ([model.rs](../model.md)); пустой, если предмета нет.
- **`ArtIndex::state(id, state)`** — картинка состояния: `open` у общих сумок (так сумка выглядит в инвентаре), `Empty` у бутылок; пустая, если состояния нет.
- `image(files)` (приватная) — `60/x.hash.avif` → `art/60/x.hash` (`x1`) и то же для клетки 120 (`x2`). Предмет без обоих размеров пропускается.

## Тесты
`reads_both_densities_and_defaults_to_empty`.

## Связи
- Формат манифеста: [art/manifest.rs](/docs/Backend/crates/art/src/manifest.md). Вызывающий: `Catalog::load` в [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
