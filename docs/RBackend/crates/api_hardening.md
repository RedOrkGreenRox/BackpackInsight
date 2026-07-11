# api hardening

Protected RBackend data endpoints are guarded by `X-Internal-Secret` when `API_SECRET` or `ROOT_API_SECRET` is configured:

```text
GET  /api/items.fb
GET  /api/catalog-summary.fb
POST /api/profile.fb
```

The secret must stay server-side. Cloudflare Pages Function / Worker injects it while proxying to the VPS; browser JavaScript must not receive it.

Production startup rule:

```text
ROOT_ENV=production requires API_SECRET/ROOT_API_SECRET
```

`ROOT_ALLOW_NO_SECRET=true` exists only as an explicit escape hatch and should not be used on the server.

Unauthorized protected route responses are binary `ApiError` packs (`BIER`) with `application/octet-stream`.

---
> 📌 **Подпись документации:** api hardening for binary-only RBackend, 2026-07-11.
