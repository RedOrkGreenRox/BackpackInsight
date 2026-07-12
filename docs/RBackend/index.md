# RBackend — Rust backend workspace

`RBackend/` — активный Rust-бэкенд Backpack Insight. Заменил Python/FastAPI. Стек: Axum + FlatBuffers + sqlx + SQLite/PostgreSQL.

## Workspace overview

| Crate | Responsibility | Документация |
| :--- | :--- | :--- |
| `core` | small single-purpose domain services: slugs, image keys, profile fields, item/hero rules | [crates/core.md](crates/core.md) |
| `api` | Axum runtime server (port 8090) | [crates/api.md](crates/api.md) |
| `db` | SQLx persistence (Postgres + SQLite), нормализованная схема | [crates/db.md](crates/db.md) |
| `pack` | FlatBuffers read/write layer + generated bindings | [crates/pack.md](crates/pack.md) |
| `middleware` | backend-owned binary decoders для frontend/WASM | [crates/middleware.md](crates/middleware.md) |
| `builder` | валидирует source JSON и собирает FlatBuffer-паки | [crates/build.md](crates/build.md) |
| `cli` | dev-диагностика вокруг source JSON/profile JSON | [crates/cli.md](crates/cli.md) |

Runtime backend→middleware/frontend data contract = **FlatBuffer-only**. Legacy JSON endpoints удалены.

## Тематические доки (crates/)

- [api.md](crates/api.md) — operational + binary endpoints.
- [api_binary_packs.md](crates/api_binary_packs.md) — binary contracts `BIAI`/`BICS`/`BIPR`/`BIER`.
- [api_hardening.md](crates/api_hardening.md) — rate-limit, secret, subtle.
- [api_items_pack.md](crates/api_items_pack.md) — items FB schema.
- [api_profile_fb.md](crates/api_profile_fb.md) — profile FB schema.
- [api_sitemap_robots.md](crates/api_sitemap_robots.md) — SEO endpoints.
- [build.md](crates/build.md), [build_flatbuffer.md](crates/build_flatbuffer.md) — builder pipeline.
- [core.md](crates/core.md), [core_catalog.md](crates/core_catalog.md), [core_catalog_columns.md](crates/core_catalog_columns.md).
- [core_items.md](crates/core_items.md), [core_profile_check.md](crates/core_profile_check.md), [core_profile_identity.md](crates/core_profile_identity.md), [core_profile_score.md](crates/core_profile_score.md), [core_profile_wallet.md](crates/core_profile_wallet.md), [core_unlocks.md](crates/core_unlocks.md).
- [db.md](crates/db.md), [middleware.md](crates/middleware.md), [pack.md](crates/pack.md), [cli.md](crates/cli.md).

## Per-file mirror docs (crates/*/src/)

- **api/src/**: [lib](crates/api/src/lib.md), [main](crates/api/src/main.md), [state](crates/api/src/state.md), [error](crates/api/src/error.md).
- **api/src/profile/**: [mod](crates/api/src/profile/mod.md), [catalog_cache](crates/api/src/profile/catalog_cache.md), [heroes](crates/api/src/profile/heroes.md), [items](crates/api/src/profile/items.md), [json_input](crates/api/src/profile/json_input.md), [view](crates/api/src/profile/view.md), [regression_tests](crates/api/src/profile/regression_tests.md).
- **api/src/routes/**: [mod](crates/api/src/routes/mod.md), [health](crates/api/src/routes/health.md), [packs](crates/api/src/routes/packs.md), [profile_binary](crates/api/src/routes/profile_binary.md), [robots](crates/api/src/routes/robots.md), [root](crates/api/src/routes/root.md), [sitemap](crates/api/src/routes/sitemap.md).
- **api/src/security/**: [mod](crates/api/src/security/mod.md), [rate_limit](crates/api/src/security/rate_limit.md), [secret](crates/api/src/security/secret.md).
- **api/src/seo/**: [mod](crates/api/src/seo/mod.md), [robots](crates/api/src/seo/robots.md), [sitemap](crates/api/src/seo/sitemap.md).
- **builder/src/**: [main](crates/builder/src/main.md), [root](crates/builder/src/root.md), [catalog/mod](crates/builder/src/catalog/mod.md), [files](crates/builder/src/catalog/files.md), [locales](crates/builder/src/catalog/locales.md), [validate](crates/builder/src/catalog/validate.md), [images](crates/builder/src/catalog/images.md), [flatbuffer](crates/builder/src/catalog/flatbuffer.md), [api_items_flatbuffer](crates/builder/src/catalog/api_items_flatbuffer.md).
- **cli/src/**: [main](crates/cli/src/main.md).
- **core/src/**: [lib](crates/core/src/lib.md), [slug](crates/core/src/slug.md), [image_key](crates/core/src/image_key.md), [catalog/mod](crates/core/src/catalog/mod.md), [columns](crates/core/src/catalog/columns.md), [ids](crates/core/src/catalog/ids.md), [strings](crates/core/src/catalog/strings.md), [profile/mod](crates/core/src/profile/mod.md), [area](crates/core/src/profile/area.md), [check](crates/core/src/profile/check.md), [level](crates/core/src/profile/level.md), [score](crates/core/src/profile/score.md), [types](crates/core/src/profile/types.md), [heroes/*](crates/core/src/profile/heroes/mod.md), [identity/*](crates/core/src/profile/identity/mod.md), [items/*](crates/core/src/profile/items/mod.md), [unlocks/*](crates/core/src/profile/unlocks/mod.md), [wallet/*](crates/core/src/profile/wallet/mod.md).
- **db/src/**: [lib](crates/db/src/lib.md), [profile](crates/db/src/profile.md), [seed](crates/db/src/seed.md).
- **middleware/src/**: [lib](crates/middleware/src/lib.md), [error](crates/middleware/src/error.md), [items](crates/middleware/src/items.md), [profile](crates/middleware/src/profile.md).
- **pack/src/**: [lib](crates/pack/src/lib.md), [error](crates/pack/src/error.md), [catalog](crates/pack/src/catalog.md), [api_items](crates/pack/src/api_items.md), [profile](crates/pack/src/profile.md).

## Schemas + deployment

- [schemas.md](schemas.md) — FlatBuffer `.fbs`-схемы.
- [Dockerfile.md](Dockerfile.md) — multi-stage Rust-сборка.

## Architecture notes

- [data_source_layer.md](data_source_layer.md), [json_removal_backend.md](json_removal_backend.md), [pack_only_mode.md](pack_only_mode.md).
- [docker_replacement.md](docker_replacement.md), [compose_merge_plan.md](compose_merge_plan.md), [production_pack_docker.md](production_pack_docker.md).
- [cloudflare_edge_security.md](cloudflare_edge_security.md), [current_frontend_run.md](current_frontend_run.md).
- [backend_optimization_notes.md](backend_optimization_notes.md), [backend_remaining_plan.md](backend_remaining_plan.md), [granularity_audit.md](granularity_audit.md), [frontend_practices_gap_analysis.md](frontend_practices_gap_analysis.md).

## Куда дальше

- [Backend index](../Backend/index.md) — источники JSON-данных.
- [Data index](../data/index.md) — игровые механики.

---
> 📌 **Подпись документации:** RBackend workspace hub (обновлено для Rust) · 2026-07-12.
