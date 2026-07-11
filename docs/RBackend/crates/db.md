# db — SQLx persistence layer

`db` — Rust/SQLx persistence crate for RBackend.

This crate keeps profile persistence from the old backend.

## Current scope

```text
PostgreSQL pool
SQLx migrations
profiles table
atomic upsert by uid
profile FlatBuffer bytes stored as BYTEA
```

## Migration

```text
RBackend/crates/db/migrations/0001_profiles.sql
```

## Stored profile fields

```text
uid
nickname
level
trophy
bonus_trophy
coins
gems
area
profile_fb
created_at
updated_at
```

No raw user JSON is stored here.

---
> 📌 **Подпись документации:** SQLx persistence layer for RBackend, 2026-07-11.
