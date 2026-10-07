# [Точка входа утилиты art (main.rs)](/Backend/crates/art/src/main.rs)

## Назначение
Точка входа утилиты `art`: конвейер картинок предметов из оригинального ContentKit по [правилам](../rules.toml.md).

```text
art check --kit <ContentKit> --export <items.json> [--rules <rules.toml>]
art build --kit <ContentKit> --export <items.json> --out <dir> [--rules <rules.toml>]
```

## Ключевая функциональность
- **`run(args)`** — разбирает команду и флаги (`parse_flags`: только пары `--ключ значение`), читает правила (по умолчанию `crates/art/rules.toml` через `CARGO_MANIFEST_DIR`).
  - `check` — [check.rs](check.md), печатает отчёт.
  - `build` — `prepare_out`, затем [build.rs](build.md) с `Quality::default()`; печатает число собранных, пропущенных по правилам и вписанных с полями.
- **`prepare_out(out)`** — создаёт папку; непустую папку принимает только если там `manifest.json` (прошлый вывод `art`) и тогда удаляет числовые подпапки размеров и манифест, чтобы не копились файлы со старыми хешами. Чужую непустую папку не трогает — ошибка.
- **`usage()`** — строка подсказки.
- Ошибка любой команды — код выхода 1.

## Модули
[build](build.md), [check](check.md), [encode](encode.md), [item](item.md), [kit](kit.md), [manifest](manifest.md), [render](render.md), [resolve](resolve.md), [rules](rules.md), тестовый [test_kit](test_kit.md).

## Использование
Вывод для сайта: `--out Frontend/Web/static/images/art`, экспорт — `Backend/data/items_en_X_Y_Z.json`. Сайт читает манифест в [branches/catalog/art.rs](/docs/Backend/crates/branches/src/catalog/art.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
