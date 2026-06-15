# [Сброс БД (reset_db.py)](../../../Backend/DB/reset_db.py)

## Назначение
Опасный операционный скрипт: полностью удаляет и пересоздаёт таблицы БД. Требует ручного подтверждения вводом `DELETE`.

## Связи (Dependencies)
*   [Конфигурация БД (database.py)](database.md): берёт `DATABASE_URL`.
*   Модели [Profile](../playerdata/models/Profile.md)/[Item](../playerdata/models/Item.md)/[Hero](../playerdata/models/Hero.md) — импортируются для регистрации в метаданных.

## Подробное описание `reset_database()`
1.  Печатает предупреждение и требует ввод `DELETE` (иначе отмена).
2.  Создаёт engine, импортирует модели (чтобы `metadata` знал таблицы).
3.  При ошибке импорта — fallback для PostgreSQL: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.
4.  Иначе: `SQLModel.metadata.drop_all` → `create_all` (пустые таблицы).

## AI-контекст
*   Деструктивная операция, только для dev/обслуживания. В проде схемой управляет Alembic ([env.py](migrations/env.md)); `reset_db.py` — аварийный/локальный инструмент. Импорт моделей обязателен, иначе `drop_all` не увидит таблицы.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
