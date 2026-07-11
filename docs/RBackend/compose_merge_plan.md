# Docker Compose merge / auto-detect checkpoint

Status: implemented as one active Compose file plus script-owned mode detection.

## Active Compose files

```text
docker-compose.yml        # single active local/server compose
docker-compose.server.yml # removed
```

## Services by mode

Local mode starts:

```text
db
backend
web
```

Server mode starts only backend-side services:

```text
db
backend
```

`web` is still declared in the single compose file, but it has the `local` profile and `run_docker.py --server` never targets it. Cloudflare Pages remains responsible for production frontend hosting.

## Auto-detection entrypoint

`run_docker.py` owns local/server detection. Compose YAML itself is intentionally dumb; it only consumes environment variables.

Priority:

1. CLI override: `python scripts/run_docker.py --server` or `--local`.
2. Env / `.env`: `BACKPACK_DOCKER_MODE=server|local|auto` or `BACKPACK_ENV=server|local`.
3. Auto mode: `ROOT_ENV=production` or `BACKPACK_ENV=server|production|prod` means server; otherwise local.

Defaults applied by the script:

```text
local:  ROOT_ENV=development BACKEND_BIND=127.0.0.1 POSTGRES_BIND=127.0.0.1 FRONTEND_BIND=127.0.0.1 FRONTEND_PORT=5080 ROOT_DB_ENABLED=true
server: ROOT_ENV=production  BACKEND_BIND=0.0.0.0 POSTGRES_BIND=127.0.0.1 ROOT_DB_ENABLED=true
```

## Raw docker compose usage

Preferred local command:

```bash
python scripts/run_docker.py --local
```

Preferred server command:

```bash
python scripts/run_docker.py --server
```

If running Compose directly instead of the script:

```bash
# local with frontend
BACKPACK_DOCKER_MODE=local ROOT_ENV=development docker compose -f docker-compose.yml up -d --build db backend web

# server without frontend
ROOT_ENV=production BACKEND_BIND=0.0.0.0 POSTGRES_BIND=127.0.0.1 docker compose -f docker-compose.yml up -d --build db backend
```

## Why detection is in Python, not YAML

Docker Compose cannot reliably infer deployment intent from the host. It can interpolate env vars, but it should not decide whether a machine is production. The safe split is:

- `docker-compose.yml` declares services;
- `scripts/run_docker.py` decides local/server and exports defaults;
- `.env` can pin server behavior explicitly.

---
> 📌 **Подпись документации:** merged compose with local frontend and server backend-only mode, 2026-07-11.
