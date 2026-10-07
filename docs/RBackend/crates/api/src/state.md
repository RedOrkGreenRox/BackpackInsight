# [Общее состояние сервера (state.rs)](/RBackend/crates/api/src/state.rs)

## Назначение
`AppState` — общее состояние сервера, которое Axum передаёт обработчикам и слоям. Собирается один раз при старте: бинарник `api` вызывает `AppState::discover()`, сайт `branches` — `AppState::load()` ([roots/runner.rs](../../branches/src/roots/runner.md)).

## Поля и переменные окружения
| Поле | Источник | По умолчанию |
| :--- | :--- | :--- |
| `project_root` | `discover_project_root()` | — |
| `api_secret` | `ROOT_API_SECRET`, затем `API_SECRET` (пустые игнорируются) | `None` |
| `public_base_url` | `ROOT_PUBLIC_BASE_URL` | `https://backpackinsight.pages.dev` |
| `cors_origin` | `ROOT_CORS_ORIGIN`, затем `CORS_ORIGIN` | `https://backpackinsight.pages.dev` |
| `max_body_bytes` | `ROOT_MAX_BODY_BYTES` | 1 МиБ |
| `db` | `db::Db::connect_from_env_if_enabled` ([db/lib](../../db/src/lib.md)) | `None`, если БД выключена |
| `profile_rate_limiter` | `ROOT_PROFILE_RATE_LIMIT`, затем `RATE_LIMIT_PROFILES`, через `parse_rate_limit` | 20 запросов в минуту |

## `load()` и `discover()`
`load()`:
1. Находит корень проекта и секрет.
2. При `ROOT_ENV=production` без секрета возвращает ошибку, если не задан `ROOT_ALLOW_NO_SECRET` со значением `true` или `1`.
3. Подключает БД; если она есть, вызывает `db::seed_itemdefinitions_if_empty` ([db/seed](../../db/src/seed.md)).
4. Заполняет поля. Паки не проверяет, но засев БД из шага 3 сам читает паки `api_items_{en,ru}.fb`.

`discover()` = `load()` + `verify_required_packs()`. Публичный `verify_required_packs` требует в `RBackend/generated` файлы `catalog_summary.fb`, `api_items_en.fb`, `api_items_ru.fb`, иначе ошибка со списком отсутствующих.

Значение лимита, которое `parse_rate_limit` ([security/rate_limit](security/rate_limit.md)) не принимает — пустое, `0`, `0/minute` или мусор, — пропускается, и берётся следующий источник, а в конце всегда 20. Поэтому лимитер в текущем коде всегда включён, хотя комментарий в исходнике говорит, что пустое значение или `0` его отключают.

## Помощники
- `discover_project_root()` — `ROOT_PROJECT_ROOT` (если задан, путь обязан существовать), иначе подъём от текущего каталога до папки с `RBackend/` или с парой `Backend/DB` и `Frontend/Web`.
- `read_non_empty_env(key)` — значение переменной, если оно не пустое после `trim`.

## Тесты
`missing_env_is_none` — несуществующая переменная даёт `None`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
