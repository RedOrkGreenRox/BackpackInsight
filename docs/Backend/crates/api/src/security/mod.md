# [Слои защиты маршрутов (mod.rs)](/Backend/crates/api/src/security/mod.rs)

## Назначение
Модуль слоёв защиты, которые [lib](../lib.md) навешивает на маршруты через `middleware::from_fn_with_state`.

| Подмодуль | Слой | Документ |
| :--- | :--- | :--- |
| `rate_limit` | `rate_limit_profile` — лимит частоты по IP для `POST /api/profile.fb` | [rate_limit](rate_limit.md) |
| `secret` | `require_api_secret` — проверка заголовка `x-internal-secret` на всех `/api/*.fb` | [secret](secret.md) |

Оба слоя отвечают отказом в бинарном формате ошибки (`"BIER"`), а не JSON. Как секрет проставляется на краю сети — [cloudflare_edge_security](../../../../cloudflare_edge_security.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
