# [core/image_key.rs](/RBackend/crates/core/src/image_key.rs)

## Назначение
Доменный тип `ImageKey` — ключ картинки предмета, вычисляемый из `ItemName` через `SlugService`.

## Ключевая функциональность
- `ImageKey(String)` — newtype.
- Реализует `fmt::Display` для прямой подстановки в пути к ассетам.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
