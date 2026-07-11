# RBackend — Rust backend workspace

`RBackend/` is the active Rust backend for Backpack Insight.

Current responsibilities:

| Crate | Responsibility |
|---|---|
| `core` | small single-purpose domain services: slugs, image keys, profile fields, item/hero rules |
| `builder` | validates developer source data and builds FlatBuffer packs |
| `pack` | isolated FlatBuffers read/write layer, including generated bindings |
| `middleware` | backend-owned binary decoders for future frontend/WASM integration |
| `db` | SQLx/PostgreSQL persistence for generated profile packs |
| `api` | Axum runtime server on port 8000 |
| `cli` | development diagnostics around source JSON/profile JSON inputs |

Runtime backend→middleware/frontend data contract is FlatBuffer-only. Legacy JSON endpoints for the old frontend are removed.

Important docs:

- `json_removal_backend.md`
- `pack_only_mode.md`
- `docker_replacement.md`
- `compose_merge_plan.md`
- `cloudflare_edge_security.md`
- `backend_remaining_plan.md`

---
> 📌 **Подпись документации:** current RBackend workspace index, 2026-07-11.
