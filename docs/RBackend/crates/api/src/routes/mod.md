# [api/routes/mod.rs](/RBackend/crates/api/src/routes/mod.rs)

## Назначение
Модуль HTTP-обработчиков. Каждый подмодуль публичный; пути назначает [lib](../lib.md).

| Подмодуль | Пути | Документ |
| :--- | :--- | :--- |
| `root` | `GET /` | [root](root.md) |
| `health` | `GET /health`, `GET /ready` | [health](health.md) |
| `sitemap` | `GET /sitemap.xml`, `GET /api/sitemap` | [sitemap](sitemap.md) |
| `robots` | `GET /robots.txt` | [robots](robots.md) |
| `packs` | `GET /api/items.fb`, `GET /api/catalog-summary.fb` | [packs](packs.md) |
| `profile_binary` | `POST /api/profile.fb` | [profile_binary](profile_binary.md) |

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
