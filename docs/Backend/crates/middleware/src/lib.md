# [Декодеры FlatBuffer (lib.rs)](/Backend/crates/middleware/src/lib.rs)

## Назначение
Crate `middleware` — декодеры FlatBuffer-контрактов API на стороне бэкенда. Он превращает байты паков в обычные Rust-структуры с `serde::Serialize`, не открывая потребителям типы crate [pack](../../pack/src/lib.md). Зависимости по Cargo.toml — только crate pack и serde.

## Модули и реэкспорты
| Модуль | Экспорт | Документ |
| :--- | :--- | :--- |
| `error` | `decode_error`, `ErrorData` | [error](error.md) |
| `items` | `decode_items`, `ItemData`, `ItemsData` | [items](items.md) |
| `profile` | `decode_profile`, `HeroData`, `ProfileData`, `ProfileItemData` | [profile](profile.md) |

Модули приватные (`mod`), наружу видны только перечисленные имена.

## Потребители
- `decode_items` — [api/profile/catalog_cache](../../api/src/profile/catalog_cache.md), [api/seo/sitemap](../../api/src/seo/sitemap.md), [db/seed](../../db/src/seed.md).
- `decode_profile` и `decode_error` внутри workspace не вызываются; они повторяют форму, которую фронтенд читает в [flatbuffer-decoders](../../../../Frontend/ground/middleware/flatbuffer-decoders.md).

Обзор crate — [middleware.md](../../middleware.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
