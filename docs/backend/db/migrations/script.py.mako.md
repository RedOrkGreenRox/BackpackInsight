# [Шаблон миграций Alembic (script.py.mako)](../../../../Backend/DB/migrations/script.py.mako)

## Назначение
Mako-шаблон, по которому Alembic генерирует новые файлы миграций (`alembic revision`). Задаёт «скелет» каждой миграции.

## Содержимое
*   Док-строка с `${message}`, `${up_revision}`, `${down_revision}`, `${create_date}`.
*   Импорты `alembic.op`, `sqlalchemy`, `sqlmodel` + опциональные `${imports}`.
*   Идентификаторы ревизии (`revision`, `down_revision`, `branch_labels`, `depends_on`).
*   Функции `upgrade()`/`downgrade()` с плейсхолдерами `${upgrades}`/`${downgrades}`.

## Связи (Dependencies)
*   Используется окружением [env.py](env.md) при генерации ревизий; результат — файлы в [versions/](versions/0001_initial_schema.md).

## AI-контекст
*   Обратите внимание на `import sqlmodel` в шаблоне — он добавлен, чтобы автогенерируемые колонки `sqlmodel.sql.sqltypes.AutoString` резолвились. Правьте шаблон, только если нужно менять формат ВСЕХ будущих миграций.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
