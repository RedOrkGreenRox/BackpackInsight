"""
Общая инфраструктура для тестов.

Каждый тест получает свежую in-memory SQLite БД с предзагруженными
статическими предметами (ItemDefinition) из items_*.json.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

# --- Project path setup ----------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Не используем production-БД в тестах
os.environ.setdefault("USE_SQLITE", "True")
os.environ.pop("API_SECRET", None)  # тесты идут без секрета

# --- Imports after sys.path ------------------------------------------------
from fastapi.testclient import TestClient  # noqa: E402

from Backend.PlayerData import api as api_module  # noqa: E402
from Backend.PlayerData.models import Hero, Item, ItemDefinition, Profile  # noqa: E402,F401
from Backend.PlayerData.services.ProfileFactory import ProfileFactory  # noqa: E402
from Backend.DB.database import get_session  # noqa: E402

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


# --- Engine / Session ------------------------------------------------------


@pytest.fixture(name="engine")
def engine_fixture():
    """Свежий in-memory SQLite engine на каждый тест."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture(name="session")
def session_fixture(engine):
    """
    Сессия с подгруженными статическими ItemDefinition из JSON.
    После теста ProfileFactory кеш сбрасывается, чтобы не было
    DetachedInstanceError между тестами.
    """
    ProfileFactory.clear_cache()

    with Session(engine) as setup_session:
        ProfileFactory.preload_definitions(setup_session)
        for def_obj in list(ProfileFactory.get_cached_definitions().values()):
            # переподключаем к новой сессии (объекты могли быть detached)
            if def_obj not in setup_session:
                setup_session.merge(def_obj)
        setup_session.commit()

    ProfileFactory.clear_cache()

    with Session(engine) as session:
        # перезагружаем кеш из БД, чтобы фабрика работала
        ProfileFactory.preload_definitions(session)
        yield session

    ProfileFactory.clear_cache()


@pytest.fixture(name="client")
def client_fixture(session):
    """FastAPI TestClient с подменой зависимости БД."""
    def _override_get_session():
        yield session

    api_module.app.dependency_overrides[get_session] = _override_get_session
    with TestClient(api_module.app) as client:
        yield client
    api_module.app.dependency_overrides.clear()


# --- Fixture helpers -------------------------------------------------------


@pytest.fixture
def profile_json_minimal() -> dict:
    """Минимально валидный синтетический JSON профиля."""
    import json

    with open(FIXTURES_DIR / "synthetic_profile_minimal.json", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def profile_json_full() -> dict:
    """Полный синтетический JSON со скинами, баннерами и неизвестным предметом."""
    import json

    with open(FIXTURES_DIR / "synthetic_profile_full.json", encoding="utf-8") as f:
        return json.load(f)
