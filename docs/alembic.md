# [Конфигурация Alembic (alembic.ini)](../alembic.ini)

## Назначение
Конфиг миграций Alembic: расположение скриптов, формат имён ревизий, логирование. Используется командой `alembic upgrade head`.

## Связи (Dependencies)
*   Указывает на каталог миграций с [env.py](backend/db/migrations/env.md) и [versions/](backend/db/migrations/versions/0001_initial_schema.md).
*   Копируется в образ бэкенда ([Dockerfile](backend/playerdata/Dockerfile.md)) в `/app/alembic.ini`.

## AI-контекст
*   URL БД берётся не отсюда, а из приложения (`env.py` импортирует `engine`) — конфиг минимален. Запускается из рабочей директории, где лежит `alembic.ini`.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
