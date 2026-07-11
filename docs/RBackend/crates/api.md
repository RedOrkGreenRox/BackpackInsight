# api crate — RBackend Axum server

`api` is the runtime Rust backend. It exposes operational text/XML endpoints and protected binary FlatBuffer API endpoints.

## Operational endpoints

```text
GET /              text/plain
GET /health        text/plain
GET /ready         text/plain, verifies generated packs
GET /sitemap.xml   XML
GET /api/sitemap   XML
GET /robots.txt    text/plain
```

## Binary contract endpoints

```text
GET  /api/items.fb?lang=en|ru
GET  /api/catalog-summary.fb
POST /api/profile.fb
```

All protected data endpoints return `application/octet-stream`:

- success packs: `BIAI`, `BICS`, `BIPR`;
- error pack where applicable: `BIER`.

## Removed endpoints

```text
GET  /api/items
GET  /api/catalog-summary
POST /api/profile
POST /api/profile-summary
```

These are not hidden behind a flag; the route modules were removed from the active API tree.

## Active modules

```text
api/src/routes/packs.rs
api/src/routes/profile_binary.rs
api/src/routes/health.rs
api/src/routes/sitemap.rs
api/src/routes/robots.rs
api/src/security/secret.rs
api/src/profile/*
api/src/seo/*
```

---
> 📌 **Подпись документации:** current binary-only api crate, 2026-07-11.
