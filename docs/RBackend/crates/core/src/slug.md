# [core/slug.rs](/RBackend/crates/core/src/slug.rs)

## Назначение
Доменный тип `ItemName` + `SlugService` — нормализация имени предмета в URL-слаг с поддержкой unicode-normalization.

## Ключевая функциональность
- `ItemName(String)` — newtype имени предмета.
- `SlugService::slug(&ItemName)` — генерация слага.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
