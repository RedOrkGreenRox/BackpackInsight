# [pack/error.rs](/RBackend/crates/pack/src/error.rs)

## Назначение
`ApiErrorPack` + `read_api_error_bytes`/`build_api_error_bytes` — чтение/запись FlatBuffer `BIER`.

## Ключевая функциональность
- `struct ApiErrorPack { code, detail, issues }`.
- `build_api_error_bytes(pack)` → `Vec<u8>`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
