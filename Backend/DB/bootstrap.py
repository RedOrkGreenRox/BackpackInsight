"""
Идемпотентный бутстрап схемы БД перед стартом приложения.

Решает проблему краш-лупа бэкенда: `alembic upgrade head` падает с
"table already exists", если БД (том postgres_data) была создана ДО введения
Alembic — таблицы есть, а строки в alembic_version нет.

Логика (та же, что в .github/workflows/deploy.yml, но работает и локально):
  1. Нет alembic_version, но есть прикладные таблицы (profile/itemdefinition)
     → это «старая» БД: ставим штамп `stamp head` (схема уже актуальна).
  2. Иначе (пустая БД либо уже под управлением Alembic)
     → обычный `upgrade head`.

Работает и для PostgreSQL, и для SQLite. Запуск:
    python -m Backend.DB.bootstrap
"""
from __future__ import annotations

import sys
from pathlib import Path

# Корень проекта (Backend/DB/bootstrap.py -> ../../)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import inspect, text  # noqa: E402
from alembic.config import Config  # noqa: E402
from alembic import command  # noqa: E402

from Backend.DB.database import engine  # noqa: E402


def _alembic_config() -> Config:
    return Config(str(PROJECT_ROOT / "alembic.ini"))


def _ensure_extensions() -> None:
    """
    Создаёт расширения PostgreSQL, необходимые приложению.

    Раньше это делал init_db.sql, монтируемый в /docker-entrypoint-initdb.d/.
    На Bazzite/Podman rootless bind-mount этого файла вызывал ошибки прав доступа
    (ls: Permission denied в логах), поэтому расширения перенесены сюда.

    CREATE EXTENSION IF NOT EXISTS — идемпотентная операция, безопасно вызывать
    при каждом старте. Для SQLite вызов пропускается.
    """
    db_url = str(engine.url)
    if db_url.startswith("sqlite"):
        return  # SQLite не поддерживает расширения PostgreSQL

    try:
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        print("[bootstrap] Extension pg_trgm: OK", flush=True)
    except Exception as exc:
        # Не падаем — расширение некритично для старта, но сообщаем
        print(f"[bootstrap] WARNING: could not create pg_trgm extension: {exc}", flush=True)


def main() -> int:
    _ensure_extensions()

    insp = inspect(engine)
    tables = set(insp.get_table_names())

    has_alembic = "alembic_version" in tables
    # Прикладные таблицы, по которым видно, что схема уже создана.
    has_core = bool(tables & {"profile", "itemdefinition", "hero", "item"})

    cfg = _alembic_config()

    if not has_alembic and has_core:
        # «Старая» БД без версии Alembic — не пересоздаём таблицы, просто штампуем.
        print("[bootstrap] Tables exist without alembic_version -> stamp head", flush=True)
        command.stamp(cfg, "head")
        # На случай, если появились НОВЫЕ ревизии поверх (stamp ставит на head текущих файлов,
        # поэтому отдельный upgrade не нужен, но вызов безопасен и идемпотентен).
        return 0

    print("[bootstrap] Running alembic upgrade head", flush=True)
    command.upgrade(cfg, "head")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001
        # Печатаем компактно и выходим с ненулевым кодом, чтобы было видно в логах контейнера.
        print(f"[bootstrap] FAILED: {type(exc).__name__}: {exc}", flush=True)
        sys.exit(1)
