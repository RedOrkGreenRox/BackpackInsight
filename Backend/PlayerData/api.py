import traceback
import hashlib
import os
from typing import List, Dict, Any, Annotated
import json
from fastapi import Depends, FastAPI, APIRouter, HTTPException, Request, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, text

from Backend.PlayerData.models.Item import ItemDefinition
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.services.ProfileFactory import ProfileFactory
from Backend.DB.database import engine, get_session

app = FastAPI(title="Backpack Insight API")

# --- ЗАЩИТА И CORS ---

# 1. Настройка CORS для Cloudflare Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://backpackinsight.pages.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Проверка секретного ключа (берется из .env сервера)
API_SECRET = os.getenv("API_SECRET")

def verify_proxy_secret(x_internal_secret: str = Header(None)):
    # Исправлено: Проверяем секрет ТОЛЬКО если он задан в переменных окружения.
    # Если API_SECRET не задан (локальная разработка), разрешаем доступ.
    print(f"--- DEBUG: API_SECRET length = {len(API_SECRET) if API_SECRET else 'None'}")
    print(f"--- DEBUG: x_internal_secret length = {len(x_internal_secret) if x_internal_secret else 'None'}")
    print(f"--- DEBUG: API_SECRET first 5 chars = {API_SECRET[:5] if API_SECRET else 'None'}")
    print(f"--- DEBUG: x_internal_secret first 5 chars = {x_internal_secret[:5] if x_internal_secret else 'None'}")
    
    if API_SECRET and x_internal_secret != API_SECRET:
        print("--- DEBUG: Secret mismatch - returning 403")
        raise HTTPException(status_code=403, detail="Direct access forbidden")
    
    print("--- DEBUG: Secret verification passed")

# Добавляем проверку секрета как глобальную зависимость для всех путей в api_router
api_router = APIRouter(prefix="/api", dependencies=[Depends(verify_proxy_secret)])

def create_indexes(engine):
    """Создает GIN индексы для быстрого поиска в PostgreSQL."""
    driver = engine.url.drivername
    if "postgres" not in driver:
        return

    print("--- API: Checking/Creating Indexes ---")
    try:
        with engine.connect() as conn:
            conn.commit()
            # Попытка создать расширение (требует superuser)
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
                conn.commit()
            except Exception as e:
                print(f"--- API WARNING: Could not create extension pg_trgm (might need superuser): {e}")
                # Продолжаем, так как расширение может быть уже создано администратором

            # Создание индексов
            try:
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_itemdefinition_name_trgm ON itemdefinition USING gin (name gin_trgm_ops);"
                ))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_itemdefinition_id_trgm ON itemdefinition USING gin (item_id gin_trgm_ops);"
                ))
                conn.commit()
                print("--- API: Indexes created successfully ---")
            except Exception as e:
                print(f"--- API WARNING: Could not create indexes: {e}")
    except Exception as e:
        print(f"--- API WARNING: DB Connection failed during index creation: {e}")


@app.on_event("startup")
def on_startup():
    from sqlmodel import SQLModel, func
    from Backend.PlayerData.data import get_items
    SQLModel.metadata.create_all(engine)
    create_indexes(engine)

    # Предзагрузка статических данных предметов с синхронизацией
    with Session(engine) as session:
        # Проверяем актуальность данных в БД
        db_count = session.exec(select(func.count(ItemDefinition.item_id))).one()
        json_items = get_items()
        json_count = len(json_items)
        
        print(f"--- API: Database items: {db_count}, JSON items: {json_count} ---")
        
        # Проверяем есть ли вообще данные в БД
        existing = session.exec(select(ItemDefinition)).first()
        
        # Если БД пустая или данные не актуальны - синхронизируем
        if not existing or db_count != json_count:
            if not existing:
                print("--- API: Migrating Static Data ---")
            else:
                print("--- API: Syncing Database with JSON ---")
                
            # Очищаем старые данные с учетом foreign key constraints
            if existing:
                from sqlmodel import delete
                try:
                    # Сначала удаляем зависимые записи из таблицы item
                    session.exec(delete(Item))
                    session.commit()
                    print("--- API: Cleared dependent items ---")
                except Exception as e:
                    print(f"--- API WARNING: Could not clear items: {e} ---")
                    session.rollback()
                
                try:
                    # Затем удаляем определения предметов
                    session.exec(delete(ItemDefinition))
                    session.commit()
                    print("--- API: Cleared item definitions ---")
                except Exception as e:
                    print(f"--- API WARNING: Could not clear definitions: {e} ---")
                    session.rollback()
            
            # Загружаем актуальные данные
            try:
                ProfileFactory.preload_definitions(session)
                for def_obj in ProfileFactory.get_cached_definitions().values():
                    session.add(def_obj)
                session.commit()
                print(f"--- API: Synced {json_count} items from JSON to Database ---")
            except Exception as e:
                print(f"--- API ERROR: Could not load definitions: {e} ---")
                session.rollback()
        else:
            print("--- API: Database is up to date ---")


# --- МАРШРУТЫ API ---

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
def get_items(response: Response, session: Annotated[Session, Depends(get_session)]):
    response.headers["Cache-Control"] = "public, max-age=3600"
    return session.exec(select(ItemDefinition)).all()


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

    except Exception as e:
        session.rollback()  # Важно: откат транзакции при ошибке
        print(f"--- API Error processing profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Failed to process profile: {str(e)}")


# 3. Подключение роутера к приложению
app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Backpack Insight API is running"}