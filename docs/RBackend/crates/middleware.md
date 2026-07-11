# middleware — backend-owned FlatBuffer decoder layer

`middleware` — backend-owned compatibility layer for the future frontend side.

It decodes binary backend contracts into typed Rust structs:

```text
items.fb   -> ItemsData / ItemData
profile.fb -> ProfileData / HeroData / ProfileItemData
error.fb   -> ErrorData
```

This crate is considered part of backend, even if later compiled to WASM or used by frontend integration code.

It does not perform HTTP requests and does not parse user/source JSON. It only accepts FlatBuffer bytes.

Current modules:

```text
items.rs    decode_items
profile.rs  decode_profile
error.rs    decode_error
```

---
> 📌 **Подпись документации:** backend-owned middleware decoder layer, 2026-07-11.
