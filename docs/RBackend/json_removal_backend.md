# RBackend JSON removal checkpoint

Runtime backend→middleware/frontend contract is now binary FlatBuffers only.

## Allowed JSON

1. Developer source catalog files under `Backend/DB/*.json` — build input only.
2. User-uploaded profile body for `POST /api/profile.fb` — external game profile input only.
3. Temporary JSON passed to `flatc` during pack build — removed immediately after `.fb` generation and not copied into the runtime image.

## Removed runtime JSON compatibility

The RBackend router does **not** expose old frontend JSON endpoints:

- removed `GET /api/items`;
- removed `GET /api/catalog-summary`;
- removed `POST /api/profile`;
- removed `POST /api/profile-summary`.

Removed compatibility source modules from the active API tree:

- `api/src/catalog/*` raw JSON catalog fallback;
- old JSON route modules for items/profile/profile-summary/catalog-summary.

## Current runtime endpoints

Public operational / SEO endpoints:

- `GET /` — text/plain status;
- `GET /health` — text/plain;
- `GET /ready` — text/plain, verifies generated packs;
- `GET /sitemap.xml` and `GET /api/sitemap` — XML;
- `GET /robots.txt` — text/plain.

Protected RBackend binary endpoints:

- `GET /api/items.fb?lang=en|ru` — FlatBuffer `BIAI`;
- `GET /api/catalog-summary.fb` — FlatBuffer `BICS`;
- `POST /api/profile.fb` — FlatBuffer `BIPR` on success, `BIER` error pack on failure.

## Cloudflare edge proxy

`Frontend/Web/functions/api/[[path]].ts` is treated as backend-owned edge glue. It now proxies only the binary RBackend API allowlist and injects `X-Internal-Secret` server-side from Cloudflare environment variables. It no longer contains `/api/items` JSON caching or JSON error bodies.

## Docker/runtime cleanup

`RBackend/Dockerfile` copies only:

- `/app/api` Rust binary;
- `/app/RBackend/generated/*.fb` packs.

No Python backend is mounted into the backend container. The active `Backend/` tree now keeps only allowed developer JSON source files under `Backend/DB/*.json`; inactive Python backend/runtime code and old Python tests were removed from the active repo. The preserved `/home/user/Backpackinsight-latest` clone remains available for comparison.

`ROOT_LEGACY_JSON` and `ROOT_DATA_MODE` toggles were removed because there is no JSON runtime mode left.
