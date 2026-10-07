# Слияние Docker Compose

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

`web` is still declared in the single compose file, but it has the `local` profile and the server command below never starts it. Cloudflare Pages remains responsible for production frontend hosting.

## Mode selection

The mode is set by environment, not by a helper script (`scripts/run_docker.py` was removed on 2026-10-07: local runs go through cargo, the server is deployed by `.github/workflows/deploy.yml`). Compose YAML stays dumb; it only consumes environment variables.

Defaults per mode:

```text
local:  ROOT_ENV=development BACKEND_BIND=127.0.0.1 POSTGRES_BIND=127.0.0.1 FRONTEND_BIND=127.0.0.1 FRONTEND_PORT=5080 ROOT_DB_ENABLED=true
server: ROOT_ENV=production  BACKEND_BIND=0.0.0.0 POSTGRES_BIND=127.0.0.1 ROOT_DB_ENABLED=true
```

## Docker compose usage

```bash
# local with frontend
COMPOSE_PROFILES=local ROOT_ENV=development docker compose -f docker-compose.yml up -d --build db backend web

# server without frontend
ROOT_ENV=production BACKEND_BIND=0.0.0.0 POSTGRES_BIND=127.0.0.1 docker compose -f docker-compose.yml up -d --build db backend
```

Docker Compose cannot reliably infer deployment intent from the host, so `.env` pins server behavior explicitly.

---
> 📌 **Подпись документации:** merged compose with local frontend and server backend-only mode, 2026-07-11.
