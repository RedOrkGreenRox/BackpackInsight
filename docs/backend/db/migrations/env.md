# [Окружение Alembic (env.py)](../../../../Backend/DB/migrations/env.py)

## Назначение
Конфигурация окружения миграций Alembic. Берёт `engine` и метаданные прямо из приложения, поэтому одна команда `alembic upgrade head` поднимает БД до актуальной схемы.

## Связи (Dependencies)
*   [Конфигурация БД (database.py)](../database.md): источник `engine`.
*   `Backend.PlayerData.models`: импортируется ради регистрации всех моделей в `SQLModel.metadata`.
*   Конфиг [alembic.ini](../../../alembic.md) (корень проекта); пояснительный [README](README.md) и шаблон [script.py.mako](script.py.mako.md) — рядом.

## Подробное описание
*   **Path setup**: добавляет корень проекта (на 3 уровня выше) в `sys.path`, импортирует `engine` и модели → `target_metadata = SQLModel.metadata`.
*   `run_migrations_offline()` — генерирует SQL без подключения (`literal_binds`, `compare_type`, `render_as_batch` для SQLite).
*   `run_migrations_online()` — применяет миграции на живом соединении (`compare_type`, batch-режим для SQLite).
*   Выбор режима — по `context.is_offline_mode()`.

## AI-контекст
*   `render_as_batch` для SQLite обязателен (иначе ALTER TABLE не работает). Импорт `models` нужен именно ради side-effect регистрации таблиц в метаданных; не удаляйте его как «неиспользуемый».

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
