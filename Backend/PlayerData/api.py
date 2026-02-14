import traceback
import hashlib
import os
from typing import List, Dict, Any
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

async def verify_proxy_secret(x_internal_secret: str = Header(None)):
    if not API_SECRET or x_internal_secret != API_SECRET:
        raise HTTPException(status_code=403, detail="Direct access forbidden")

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
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    create_indexes(engine)

    # Предзагрузка статических данных предметов
    with Session(engine) as session:
        existing = session.exec(select(ItemDefinition)).first()
        if not existing:
            print("--- API: Migrating Static Data ---")
            ProfileFactory.preload_definitions()
            for def_obj in ProfileFactory.get_cached_definitions().values():
                session.add(def_obj)
            session.commit()


# --- МАРШРУТЫ API ---

@api_router.get("/items", response_model=List[ItemDefinition])
def get_items(request: Request, response: Response, session: Session = Depends(get_session)):
    """Возвращает определения предметов с поддержкой ETag (304)."""
    items = session.exec(select(ItemDefinition)).all()
    data_str = json.dumps([item.dict() for item in items], sort_keys=True)
    etag = f'"{hashlib.md5(data_str.encode()).hexdigest()}"'

    client_etag = request.headers.get("if-none-match")
    if client_etag and (client_etag == etag or client_etag == f'W/{etag}'):
        return Response(status_code=304)
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=3600"
    return items


@api_router.post("/profile")
async def process_profile(request: Request, profile_data: Dict[str, Any], session: Session = Depends(get_session)):
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