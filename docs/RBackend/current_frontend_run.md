# Current frontend + RBackend runbook

This checkpoint keeps the existing TypeScript SPA alive against the binary-only RBackend contract.

## What changed

The browser no longer fetches old JSON runtime endpoints:

```text
GET  /api/items
POST /api/profile
```

`ApiService` now fetches FlatBuffers:

```text
GET  /api/items.fb?lang=en|ru
POST /api/profile.fb
```

Then it decodes bytes in the frontend with generated FlatBuffers readers under:

```text
Frontend/Web/ground/middleware/generated/backpack-insight/*
Frontend/Web/ground/middleware/flatbuffer-decoders.ts
```

Network contract remains binary. JavaScript objects are created only inside the frontend runtime for the existing UI code.

## Local run

From repository root:

```bash
python scripts/run_docker.py --local
```

This starts all local services:

```text
PostgreSQL: 127.0.0.1:5432
RBackend:   127.0.0.1:8000
Frontend:   127.0.0.1:5080
```

Open:

```text
http://127.0.0.1:5080
http://127.0.0.1:5080/items
```

Optional Vite dev mode, if you want hot reload instead of the Docker frontend container:

```bash
cd Frontend/Web
npm ci
BACKEND_API_URL=http://127.0.0.1:8000 npm run dev
```

Then open:

```text
http://127.0.0.1:5173
http://127.0.0.1:5173/items
```

Profile smoke input:

```text
tests/fixtures/synthetic_profile_full.json
```

Paste/upload it on the main page and navigate to profile.

## Local secret behavior

If root `.env` contains `API_SECRET` or `ROOT_API_SECRET`, Vite dev proxy reads it server-side and injects:

```text
X-Internal-Secret
```

The secret is not bundled into browser JS.

## Direct checks

```bash
curl -fsS http://127.0.0.1:8000/ready
curl -fsS http://127.0.0.1:5080/api/items.fb?lang=en -o /tmp/items.fb
python - <<'PY'
from pathlib import Path
b = Path('/tmp/items.fb').read_bytes()
print(len(b), b[4:8])
PY
```

Expected identifier:

```text
BIAI
```

Old endpoints should stay removed:

```bash
curl -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/api/items?lang=en
```

Expected:

```text
404
```

## Cloudflare Pages deployment

Cloudflare Pages can keep deploying the frontend from `Frontend/Web`:

```text
build command: npm ci && npm run build
output dir:    dist
functions dir: functions
```

Required Cloudflare env vars:

```text
BACKEND=https://your-backend-host
API_SECRET=<same secret as VPS .env>
```

Cloudflare Functions inject `X-Internal-Secret` server-side. The browser never receives the backend secret.
