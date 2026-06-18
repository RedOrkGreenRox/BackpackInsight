import traceback
import hashlib
import hmac
import logging
import os
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Annotated, Optional
import json
from fastapi import Depends, FastAPI, APIRouter, HTTPException, Request, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select, text, delete

from Backend.PlayerData.models.Item import ItemDefinition, Item
from Backend.PlayerData.models.Hero import Hero
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


def _canonical_static_item_from_json(static_data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "item_id": static_data.get("id"),
        "name": static_data.get("name", "Unknown"),
        "rarity": static_data.get("rarity", "Common"),
        "coin_value": static_data.get("coinValue"),
        "item_types": static_data.get("itemTypes", []),
        "connected_hero": static_data.get("connectedHero"),
        "unlock_source": static_data.get("unlockSource"),
        "item_shape": static_data.get("itemShape", []),
        "item_stars": static_data.get("itemStars", []),
        "purchasable": static_data.get("purchasable", False),
        "recipes": static_data.get("recipes", []),
        "combat_stats_data": static_data.get("combatStats", {}),
        "all_stats_data": static_data.get("allStats", {}),
        "tooltips": static_data.get("tooltips", []),
        "levels_info": static_data.get("levels", {}),
        "names_local": static_data.get("names_local", {}),
        "tooltips_local": static_data.get("tooltips_local", {})
    }


def _canonical_static_item_from_db(def_obj: ItemDefinition) -> Dict[str, Any]:
    return {
        "item_id": def_obj.item_id,
        "name": def_obj.name,
        "rarity": def_obj.rarity,
        "coin_value": def_obj.coin_value,
        "item_types": def_obj.item_types or [],
        "connected_hero": def_obj.connected_hero,
        "unlock_source": def_obj.unlock_source,
        "item_shape": def_obj.item_shape or [],
        "item_stars": def_obj.item_stars or [],
        "purchasable": def_obj.purchasable,
        "recipes": def_obj.recipes or [],
        "combat_stats_data": def_obj.combat_stats_data or {},
        "all_stats_data": def_obj.all_stats_data or {},
        "tooltips": def_obj.tooltips or [],
        "levels_info": def_obj.levels_info or {},
        "names_local": def_obj.names_local or {},
        "tooltips_local": def_obj.tooltips_local or {}
    }


def _hash_static_payload(rows: List[Dict[str, Any]]) -> str:
    normalized = sorted(rows, key=lambda row: row.get("item_id") or "")
    payload = json.dumps(normalized, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _sync_static_data() -> None:
    """
    Синхронизация статических предметов из JSON в БД.
    Схема БД создаётся отдельно — через `alembic upgrade head` при старте контейнера.

    Актуальность определяется по SHA-256 хешу канонического представления данных,
    а не только по количеству записей.
    """
    from sqlmodel import SQLModel, delete
    from Backend.PlayerData.data import get_items

    # 1. Создаём базовую схему
    SQLModel.metadata.create_all(engine)
    create_indexes(engine)

    # 2. Авто-миграция (добавление новых колонок локализации, если БД уже существует)
    # Используем ОТДЕЛЬНЫЕ независимые транзакции для каждого ALTER, так как в PostgreSQL
    # любая ошибка внутри блока транзакции абортирует всю транзакцию и бросает исключение на выходе.
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE itemdefinition ADD COLUMN names_local JSON;"))
            logger.info("Added column names_local to itemdefinition table via auto-migration")
    except Exception:
        pass

    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE itemdefinition ADD COLUMN tooltips_local JSON;"))
            logger.info("Added column tooltips_local to itemdefinition table via auto-migration")
    except Exception:
        pass

    with Session(engine) as session:
        json_items = get_items()
        json_payload = [_canonical_static_item_from_json(item) for item in json_items.values()]
        json_hash = _hash_static_payload(json_payload)

        try:
            definitions = session.exec(select(ItemDefinition)).all()
            db_payload = [_canonical_static_item_from_db(d) for d in definitions]
            db_hash = _hash_static_payload(db_payload) if db_payload else None
        except Exception:
            db_payload = []
            db_hash = None

        logger.info(
            "Static data state: db_items=%s json_items=%s db_hash=%s json_hash=%s",
            len(db_payload),
            len(json_payload),
            db_hash[:12] if db_hash else "<empty>",
            json_hash[:12],
        )

        if db_payload and db_hash == json_hash:
            logger.info("Database static items are up to date (hash match)")
            return

        logger.info("Static item hash mismatch detected — resyncing DB data")

        if db_payload:
            try:
                session.exec(delete(Item))
                session.exec(delete(ItemDefinition))
                session.commit()
            except SQLAlchemyError:
                logger.exception("Could not clear existing static data — aborting resync to avoid corruption")
                session.rollback()
                return

        try:
            ProfileFactory.clear_cache()
            ProfileFactory.preload_definitions(session)
            for def_obj in ProfileFactory.get_cached_definitions().values():
                session.add(def_obj)
            session.commit()
            logger.info("Synced %s items from JSON to DB (hash=%s)", len(json_payload), json_hash[:12])
        except SQLAlchemyError:
            logger.exception("Could not load definitions")
            session.rollback()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan-хук FastAPI (заменяет deprecated @app.on_event)."""
    _sync_static_data()
    yield
    # Shutdown — currently no-op


app = FastAPI(title="Backpack Insight API", lifespan=lifespan)

# --- RATE LIMITING ---
# Защита /api/profile от DoS и бесконтрольного раздувания БД.
# Включается только когда задан API_SECRET (т.е. в проде); в тестах/локально
# (API_SECRET отсутствует) лимит отключён, чтобы не мешать.
RATE_LIMIT_PROFILES = os.getenv("RATE_LIMIT_PROFILES", "20/minute")
_limiter_enabled = bool(API_SECRET) and bool(RATE_LIMIT_PROFILES.strip())
limiter = Limiter(key_func=get_remote_address, enabled=_limiter_enabled)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Политика хранения профилей (в днях). 0 = хранить вечно (по умолчанию).
# Очистку по этому сроку должен запускать внешний планировщик (cron),
# вызывая cleanup_old_profiles() (см. ниже).
PROFILE_RETENTION_DAYS = int(os.getenv("PROFILE_RETENTION_DAYS", "0"))

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
    lang: str = "en"
):
    response.headers["Cache-Control"] = "public, max-age=3600"
    query = select(ItemDefinition).offset(offset)
    if limit is not None:
        query = query.limit(limit)
    
    definitions = session.exec(query).all()
    
    # Локализация полей на лету
    for d in definitions:
        # Безопасно парсим names_local и tooltips_local, если они сохранены как сырые строки
        names_dict = d.names_local
        if isinstance(names_dict, str):
            try:
                names_dict = json.loads(names_dict)
            except Exception:
                names_dict = {}
        elif names_dict is None:
            names_dict = {}

        tooltips_dict = d.tooltips_local
        if isinstance(tooltips_dict, str):
            try:
                tooltips_dict = json.loads(tooltips_dict)
            except Exception:
                tooltips_dict = {}
        elif tooltips_dict is None:
            tooltips_dict = {}

        if names_dict and lang in names_dict:
            d.name = names_dict[lang]
        if tooltips_dict and lang in tooltips_dict:
            d.tooltips = tooltips_dict[lang]
            
    return definitions


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
@limiter.limit(RATE_LIMIT_PROFILES)
async def process_profile(
    request: Request,
    profile_data: Dict[str, Any],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Обрабатывает JSON профиля и возвращает данные, готовые для Jinja2.
    """
    # 1. Security & DoS Protection
    content_length = request.headers.get('content-length')
    if content_length and int(content_length) > 1024 * 1024:
        raise HTTPException(status_code=413, detail="Payload too large")

    try:
        # Создаем профиль через фабрику
        profile_obj = ProfileFactory.create_profile(profile_data)

        # --- Upsert по user_id ---
        if profile_obj.user_id:
            existing = session.exec(
                select(Profile).where(Profile.user_id == profile_obj.user_id)
            ).first()
            if existing:
                session.exec(delete(Item).where(Item.profile_id == existing.pk))
                session.exec(delete(Hero).where(Hero.profile_id == existing.pk))
                session.delete(existing)
                session.commit()

        # Сохраняем в PostgreSQL/SQLite
        session.add(profile_obj)
        session.commit()
        session.refresh(profile_obj)

        return profile_obj.to_frontend_view()

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.exception("Error processing profile")
        raise HTTPException(status_code=400, detail=f"Failed to process profile: {str(e)}")


def cleanup_old_profiles(session: Session, retention_days: Optional[int] = None) -> int:
    """
    Удаляет профили (и связанные героев/предметы) старше retention_days.
    Возвращает количество удалённых профилей.
    """
    days = retention_days if retention_days is not None else PROFILE_RETENTION_DAYS
    if not days or days <= 0:
        logger.info("Profile retention disabled (PROFILE_RETENTION_DAYS=%s), skipping cleanup", days)
        return 0

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    stale = session.exec(select(Profile).where(Profile.updated_at < cutoff)).all()
    removed = 0
    for prof in stale:
        session.exec(delete(Item).where(Item.profile_id == prof.pk))
        session.exec(delete(Hero).where(Hero.profile_id == prof.pk))
        session.delete(prof)
        removed += 1
    session.commit()
    logger.info("Cleanup: removed %s profiles older than %s days", removed, days)
    return removed


# 3. Подключение роутера к приложению
app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Backpack Insight API is running"}
