# [Зависимости бэкенда (requirements.txt)](../../../Backend/PlayerData/requirements.txt)

## Назначение
Список Python-зависимостей бэкенда для `pip install`.

## Ключевое
*   Рантайм: `fastapi`, `uvicorn`, `sqlmodel`, `psycopg2-binary`, `python-dotenv`, `alembic`, `slowapi` (rate-limit), `requests`, `deep-translator`.
*   Закреплены минимумы для фикса уязвимостей: `anyio`, `starlette`, `urllib3`, `zipp`.

## Связи (Dependencies)
*   Ставится в [Dockerfile бэкенда](Dockerfile.md).

## AI-контекст
*   `slowapi` — для лимитов `/api/profile`; `psycopg2-binary` — драйвер PostgreSQL. Пины безопасности не понижайте.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
