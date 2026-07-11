# RBackend remaining plan

## Done in current backend milestone

- Old frontend JSON runtime endpoints are removed.
- Active backend→middleware/frontend contract is FlatBuffer:
  - `GET /api/items.fb?lang=en|ru` (`BIAI`);
  - `GET /api/catalog-summary.fb` (`BICS`);
  - `POST /api/profile.fb` (`BIPR` success, `BIER` error).
- Python backend runtime code was removed from the active tree; `Backend/` keeps only allowed developer item JSON source files.
- Old Python pytest suite and Python/Rust JSON contract compare scripts were removed.
- Cloudflare Pages `/api/*` function is reduced to backend-owned binary proxy glue.
- Compose is merged to a single active `docker-compose.yml`; `run_docker.py` detects local/server mode.
- Docker smoke with PostgreSQL persistence passed.

## Still left before frontend migration

1. New frontend/middleware integration:
   - consume `.fb` bytes via backend-owned middleware decoder;
   - do not recreate `/api/items` or `/api/profile` JSON compatibility.
2. Source data relocation:
   - move allowed developer item JSON from `Backend/DB` to a clearer RBackend source folder when convenient;
   - update `builder` source paths after the move.
3. Cloudflare edge hardening:
   - keep minimal TS edge proxy, or later rewrite it as Rust/WASM Worker if the extra complexity is justified;
   - firewall VPS/backend so direct access is restricted to Cloudflare/reverse-proxy paths where possible.
4. Game formula fixes:
   - profile level calculation is intentionally preserved as compatibility logic for now;
   - replace it when the game is decomposed and the correct formula is known.
5. Optional infrastructure cleanup:
   - regenerate or prune old generated docs/indexes after the new frontend architecture is in place.

---
> 📌 **Подпись документации:** current RBackend remaining plan after JSON compatibility removal, 2026-07-11.
