# [Кодирование в AVIF и WebP (encode.rs)](/Backend/crates/art/src/encode.rs)

## Назначение
Кодирование холста в AVIF и WebP с хешем содержимого в имени: `<slug>.<hash>.<ext>` меняется только вместе с пикселями, поэтому картинки можно кешировать навсегда.

## API
- **`Quality`** — `avif` (80), `webp` (85), `avif_speed` (6); `Default`.
- **`Encoded`** — пути `avif` и `webp` относительно папки вывода (`60/apple.0a1b2c3d4e.avif`).
- **`content_hash(img)`** — первые 10 hex SHA-256 от ширины, высоты и пикселей; одинаков у AVIF и WebP одного холста.
- **`write(img, dir, rel_dir, stem, q)`** — кодирует и пишет оба файла.
- **`write_sizes(master, stem, cell_sizes, out, q)`** — для каждого размера клетки `render::scale` + `write` в `<out>/<cell>/`.
- Приватные `encode_avif` (ravif, один поток на картинку — параллелизм даёт rayon в [build.rs](build.md)) и `encode_webp` (libwebp, с потерями).

## Тесты
`hash_changes_with_pixels_only`.

## Связи
- [render.rs](render.md) (`scale`); вызывающий — [item.rs](item.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
