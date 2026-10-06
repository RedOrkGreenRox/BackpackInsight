# [art/build.rs](/RBackend/crates/art/src/build.rs)

## Назначение
Сборка `art build`: экспорт + архив + правила → картинки и `manifest.json`.

## API
- **`BuildInput`** — `kit`, `export`, `rules`, `out`, `quality`.
- **`BuildReport`** — `built`, `missing`, `letterboxed` (`id` вписанных с полями).
- **`build(input)`**:
  1. `CatalogExport::parse` экспорта, `KitIndex::scan`, `resolve_all` — если хоть один предмет без картинки и без правила, ошибка со списком всех таких `id`, файлы не пишутся;
  2. параллельно (`rayon`, свой пул со стеком 64 МБ — кодер rav1e глубоко рекурсивен) `item::render_item`;
  3. `Manifest::write`.

## Связи
- [kit.rs](kit.md), [resolve.rs](resolve.md), [item.rs](item.md), [manifest.rs](manifest.md); вызывающий — [main.rs](main.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
