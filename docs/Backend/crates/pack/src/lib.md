# [FlatBuffer-паки (lib.rs)](/Backend/crates/pack/src/lib.rs)

## Назначение
Crate `pack` — чтение и запись FlatBuffer-паков в рантайме. Сгенерированные компилятором FlatBuffers Rust-биндинги лежат в `src/generated/` (`pub mod generated`; файлы `*_generated.rs` закоммичены и исключены из зеркальной документации), поэтому сборке и серверу компилятор не нужен. Только в этом crate `Cargo.toml` переопределяет workspace-запрет unsafe-кода (`unsafe_code = "allow"` вместо `"forbid"`): его требуют сгенерированные аксессоры.

## Модули и реэкспорты
| Модуль | Экспорт | Документ |
| :--- | :--- | :--- |
| `api_items` | `read_api_items`, `read_api_items_bytes`, `ApiItemEntry`, `ApiItemsPackInfo`, `PackValue` | [api_items](api_items.md) |
| `catalog` | `read_catalog_summary`, `read_catalog_summary_bytes`, `CatalogPackInfo`, `CatalogPackItem` | [catalog](catalog.md) |
| `error` | `build_api_error_bytes`, `read_api_error_bytes`, `ApiErrorPack` | [error](error.md) |
| `profile` | `build_profile_view_bytes`, `read_profile_view_bytes`, `read_profile_view_info_bytes`, `ProfileHeroPack`, `ProfileItemPack`, `ProfileViewInfo`, `ProfileViewPack` | [profile](profile.md) |

## Связи
- Схемы паков: [schemas](../../../schemas.md); обзор crate — [pack.md](../../pack.md), бинарные контракты — [api_binary_packs](../../api_binary_packs.md).
- Потребители: [api](../../api.md) (ответы и ошибки), [middleware](../../middleware.md) (декодирование), [builder](../../build.md) (проверка собранных паков).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
