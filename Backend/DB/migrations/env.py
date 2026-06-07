"""
Alembic environment.

Engine и метаданные берутся прямо из приложения, поэтому одна команда
`alembic upgrade head` поднимает БД до актуального состояния.
"""
from __future__ import annotations

import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlmodel import SQLModel

# --- Project path setup -----------------------------------------------------
# Этот файл живёт в Backend/DB/migrations/env.py, корень проекта на 3 уровня выше.
PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Импортируем engine и регистрируем все модели, чтобы SQLModel.metadata знал о них.
from Backend.DB.database import engine  # noqa: E402
import Backend.PlayerData.models  # noqa: E402,F401 — регистрация моделей

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Generate SQL without DB connection."""
    context.configure(
        url=str(engine.url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        render_as_batch=engine.url.drivername.startswith("sqlite"),
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Apply migrations against the live engine."""
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_as_batch=engine.url.drivername.startswith("sqlite"),
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
