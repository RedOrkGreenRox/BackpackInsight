# [Тесты API (test_api.py)](../../tests/test_api.py)

## Назначение
Интеграционные тесты FastAPI через `TestClient`: эндпоинты `/api/items`, `/api/profile`, обработка ошибок/лимитов.

## Связи (Dependencies)
*   [api.py](../backend/playerdata/api.md); фикстуры из [conftest](conftest.md).

## Покрытие
*   Получение списка предметов; обработка корректного/битого профиля; коды ответов (400/413 и т.п.).

## AI-контекст
*   Рабочий тест. Использует in-memory БД из conftest; rate-limit отключён без `API_SECRET`.
## Покрываемые тест-классы и кейсы
*   `TestPublicRoutes`: `test_root`.
*   `TestItemsEndpoint`: `test_returns_list`, `test_has_cache_header`, `test_item_structure`.
*   `TestProfileEndpoint`: `test_accepts_minimal/full`, `test_rejects_empty_body/no_uid/too_large_payload`.
*   `TestSecretAuth`: `test_no_secret_required_when_not_configured`, `test_constant_time_compare`.
*   `TestStaticSync`: `test_sync_runs_idempotently`.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
