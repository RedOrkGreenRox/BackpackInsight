# [api/lib.rs](/RBackend/crates/api/src/lib.rs)

## Назначение
Сборка Axum-приложения crate `api`: дерево маршрутов, слои защиты и запуск сервера. Объявляет модули `profile`, `routes`, `security`, `seo`, `state` и реэкспортирует `AppState`. Модуль `error` здесь не объявлен — см. [error](error.md).

## Маршруты (`app(state)`)
| Путь | Обработчик | Защита |
| :--- | :--- | :--- |
| `GET /`, `GET /health`, `GET /ready` | [routes/root](routes/root.md), [routes/health](routes/health.md) | нет |
| `GET /sitemap.xml`, `GET /api/sitemap` | [routes/sitemap](routes/sitemap.md) | нет |
| `GET /robots.txt` | [routes/robots](routes/robots.md) | нет |
| `GET /api/items.fb`, `GET /api/catalog-summary.fb` | [routes/packs](routes/packs.md) | секрет |
| `POST /api/profile.fb` | [routes/profile_binary](routes/profile_binary.md) | секрет, лимит частоты, лимит тела |

Порядок слоёв для `POST /api/profile.fb` (снаружи внутрь): `require_api_secret` ([security/secret](security/secret.md)) → `rate_limit_profile` ([security/rate_limit](security/rate_limit.md)) → `DefaultBodyLimit::max(state.max_body_bytes)`. Поверх всего роутера — `cors_layer` и `TraceLayer::new_for_http()`.

## Функции
- `app(state)` — собирает `Router` и привязывает состояние `with_state`.
- `serve(addr)` — `AppState::discover()`, `TcpListener::bind`, затем `axum::serve` с `with_graceful_shutdown`.
- `cors_layer(state)` — разрешает один origin из поля `cors_origin` состояния (откуда оно берётся — [state](state.md)); если строка не парсится в `HeaderValue`, берётся `https://backpackinsight.pages.dev`. Методы GET/POST/OPTIONS, заголовки `content-type` и `x-internal-secret`.
- `shutdown_signal()` — ждёт Ctrl-C; на unix также SIGTERM и SIGINT, с записью в лог.

## Связи
Точка входа — [main](main.md); обзор эндпоинтов — [api.md](../../api.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
