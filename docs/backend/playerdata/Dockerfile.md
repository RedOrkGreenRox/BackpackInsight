# [Dockerfile бэкенда (Dockerfile)](../../../Backend/PlayerData/Dockerfile)

## Назначение
Образ бэкенда: Python 3.13-slim, установка зависимостей, копирование `Backend`, накат миграций и запуск FastAPI (uvicorn).

## Подробное описание
*   `PYTHONPATH=/app` — чтобы работали импорты `from Backend.PlayerData...`.
*   Сначала копирует [requirements.txt](requirements.md) (кеш слоя), ставит зависимости; затем `Backend` и [alembic.ini](../../alembic.md).
*   `EXPOSE 8000`; перед стартом — бутстрап схемы [bootstrap.py](../db/bootstrap.md) (безопасная замена `alembic upgrade head`), запуск с **`--workers 1`**.

## AI-контекст
*   **`--workers 1` обязателен**: [ProfileFactory](services/ProfileFactory.md) хранит кэш определений как состояние уровня класса; несколько воркеров расщепили бы кэш. Потокобезопасность внутри процесса — через RLock.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
