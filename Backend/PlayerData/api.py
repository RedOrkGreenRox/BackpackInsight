import traceback
import hashlib
import hmac
import logging
import os
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Annotated, Optional
import json
from fastapi import Depends, FastAPI, APIRouter, HTTPException, Request, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, text

from Backend.PlayerData.models.Item import ItemDefinition, Item
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.services.ProfileFactory import ProfileFactory
from Backend.DB.database import engine, get_session

logger = logging.getLogger(__name__)

# --- ЗАЩИТА И CORS ---

# Проверка секретного ключа (берется из .env сервера)
API_SECRET = os.getenv("API_SECRET")


def verify_proxy_secret(x_internal_secret: str = Header(None)):
    """
    Проверяет секретный заголовок X-Internal-Secret.
    Если API_SECRET не задан (локальная разработка/тесты) — пропускаем без проверки.
    Сравнение через hmac.compare_digest защищает от timing-атак.
    """
    if not API_SECRET:
        return

    if not x_internal_secret or not hmac.compare_digest(x_internal_secret, API_SECRET):
        logger.warning("Direct access forbidden: invalid or missing X-Internal-Secret")
        raise HTTPException(status_code=403, detail="Direct access forbidden")

def create_indexes(engine):
    """Создает GIN индексы для быстрого поиска в PostgreSQL (no-op для SQLite)."""
    driver = engine.url.drivername
    if "postgres" not in driver:
        return

    logger.info("Checking/creating indexes")
    try:
        with engine.connect() as conn:
            conn.commit()
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
                conn.commit()
            except Exception as e:
                logger.warning("Could not create extension pg_trgm: %s", e)

            try:
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_itemdefinition_name_trgm ON itemdefinition USING gin (name gin_trgm_ops);"
                ))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_itemdefinition_id_trgm ON itemdefinition USING gin (item_id gin_trgm_ops);"
                ))
                conn.commit()
                logger.info("Indexes created successfully")
            except Exception as e:
                logger.warning("Could not create indexes: %s", e)
    except Exception as e:
        logger.warning("DB connection failed during index creation: %s", e)


def _sync_static_data() -> None:
    """
    Синхронизация статических предметов из JSON в БД.
    Схема БД создаётся отдельно — через `alembic upgrade head` при старте контейнера.
    """
    from sqlmodel import SQLModel, func, delete
    from Backend.PlayerData.data import get_items

    # Fallback: если кто-то запустил приложение без миграций (например, в тестах),
    # создаём таблицы из метаданных. В проде Alembic это уже сделал.
    SQLModel.metadata.create_all(engine)
    create_indexes(engine)

    with Session(engine) as session:
        db_count = session.exec(select(func.count(ItemDefinition.item_id))).one()
        json_items = get_items()
        json_count = len(json_items)

        logger.info("DB items: %s, JSON items: %s", db_count, json_count)

        existing = session.exec(select(ItemDefinition)).first()

        if existing and db_count == json_count:
            logger.info("Database is up to date")
            return

        logger.info("Syncing static item data into DB")

        if existing:
            try:
                session.exec(delete(Item))
                session.commit()
            except Exception as e:
                logger.warning("Could not clear items: %s", e)
                session.rollback()
            try:
                session.exec(delete(ItemDefinition))
                session.commit()
            except Exception as e:
                logger.warning("Could not clear definitions: %s", e)
                session.rollback()

        try:
            ProfileFactory.preload_definitions(session)
            for def_obj in ProfileFactory.get_cached_definitions().values():
                session.add(def_obj)
            session.commit()
            logger.info("Synced %s items from JSON to DB", json_count)
        except Exception as e:
            logger.exception("Could not load definitions")
            session.rollback()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan-хук FastAPI (заменяет deprecated @app.on_event)."""
    _sync_static_data()
    yield
    # Shutdown — currently no-op


app = FastAPI(title="Backpack Insight API", lifespan=lifespan)

# CORS: берём разрешённый origin из переменной окружения.
# Значение по умолчанию — продакшн-домен на Cloudflare Pages.
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "https://backpackinsight.pages.dev")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутер с обязательной проверкой секрета
api_router = APIRouter(prefix="/api", dependencies=[Depends(verify_proxy_secret)])


# --- МАРШРУТЫ API ---

# limit/offset — опциональные параметры пагинации.
# Если не переданы (limit=None) — возвращаются все предметы (текущее поведение).
# Пример: GET /api/items?limit=100&offset=0
@api_router.get("/items", response_model=List[ItemDefinition], responses={
    200: {
        "description": "Successfully retrieved list of all item definitions",
        "content": {
            "application/json": {
                "example": [
                    {
                        "item_id": "Wooden Sword",
                        "name": "Wooden Sword",
                        "rarity": "Common"
                    }
                ]
            }
        }
    }
})
def get_items(
    response: Response,
    session: Annotated[Session, Depends(get_session)],
    limit: Optional[int] = None,
    offset: int = 0,
):
    response.headers["Cache-Control"] = "public, max-age=3600"
    query = select(ItemDefinition).offset(offset)
    if limit is not None:
        query = query.limit(limit)
    return session.exec(query).all()


@api_router.post("/profile", responses={
    200: {
        "description": "Successfully processed profile data and returned analytics",
        "content": {
            "application/json": {
                "example": {
                    "nickname": "PlayerName",
                    "level": 25,
                    "trophy": 1500,
                    "bonus_trophy": 100,
                    "gems": 500,
                    "coins": 10000,
                    "heroes_count": 5,
                    "items_count": 25
                }
            }
        }
    },
    400: {
        "description": "Bad request - Invalid JSON data or processing failed",
        "content": {
            "application/json": {
                "example": {
                    "detail": "Failed to process profile: Invalid JSON format"
                }
            }
        }
    },
    413: {
        "description": "Payload too large - Request exceeds 1MB limit",
        "content": {
            "application/json": {
                "example": {
                    "detail": "Payload too large"
                }
            }
        }
    }
})
async def process_profile(
    request: Request, 
    profile_data: Dict[str, Any], 
    session: Annotated[Session, Depends(get_session)]
):
    """
    Обрабатывает JSON профиля и возвращает данные, готовые для Jinja2.
    """
    # 1. Security & DoS Protection
    # Проверка Content-Length вместо конвертации всего JSON в строку
    content_length = request.headers.get('content-length')
    if content_length and int(content_length) > 1024 * 1024:
        raise HTTPException(status_code=413, detail="Payload too large")

    try:
        # Создаем профиль через фабрику
        profile_obj = Profile.from_json(profile_data)

        # Сохраняем в PostgreSQL
        session.add(profile_obj)
        session.commit()
        session.refresh(profile_obj)

        # Возвращаем сериализованные данные через метод модели
        return profile_obj.to_frontend_view()

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()  # Важно: откат транзакции при ошибке
        logger.exception("Error processing profile")
        raise HTTPException(status_code=400, detail=f"Failed to process profile: {str(e)}")


# 3. Подключение роутера к приложению
app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Backpack Insight API is running"}