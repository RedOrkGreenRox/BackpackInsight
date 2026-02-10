import traceback
from typing import List, Dict, Any

from fastapi import Depends, FastAPI, APIRouter, HTTPException
from sqlmodel import Session, select, text

# 1. Импорты моделей и сервисов
from Backend.PlayerData.models.Item import ItemDefinition
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.services.ProfileFactory import ProfileFactory
from Backend.DB.database import engine, get_session

# 2. Инициализация приложения и роутера
app = FastAPI(title="Backpack Insight API")
api_router = APIRouter(prefix="/api")


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
def get_items(session: Session = Depends(get_session)):
    """Возвращает все определения предметов."""
    return session.exec(select(ItemDefinition)).all()


@api_router.post("/profile")
async def process_profile(profile_data: Dict[str, Any], session: Session = Depends(get_session)):
    """
    Обрабатывает JSON профиля и возвращает данные, готовые для Jinja2.
    """
    # 1. Security & DoS Protection
    # Ограничение размера (грубая оценка)
    if len(str(profile_data)) > 1024 * 1024:  # 2 MB limit
        raise HTTPException(status_code=413, detail="Payload too large")

    try:
        # Создаем профиль через фабрику
        profile_obj = Profile.from_json(profile_data)

        # Сохраняем в PostgreSQL
        session.add(profile_obj)
        session.commit()
        session.refresh(profile_obj)

        # Извлекаем рассчитанные данные
        game_data = profile_obj.game_info_data

        # Формируем плоский словарь специально для profile.html
        return {
            "nickname": profile_obj.nickname,
            "level": profile_obj.level,
            "trophy": game_data.get("Trophy", 0),
            "bonus_trophy": game_data.get("BonusTrophy", 0),
            "gems": profile_obj.gems,
            "coins": profile_obj.coins,
            "xp_current": game_data.get("PlayerExperienceCurrent", 0),
            "xp_need": game_data.get("PlayerExperienceNeed", 0),
            "area": game_data.get("Area", "01"),
            "item_stats": game_data.get("ItemStats", {}),

            # Сериализация героев для фронтенда
            "heroes": [
                {
                    "name": h.name,
                    "level": h.level,
                    "rating": h.rating,
                    "experience": h.experience,
                    "exp_req": h.exp_req,
                    "prestige": h.prestige,
                    "league": h.league,
                    "skin_num": "01"  # Стандартный скин
                } for h in profile_obj.heroes
            ],
            "heroes_count": len(profile_obj.heroes),

            # Сериализация предметов
            "items": [
                {
                    "name": i.name,
                    "rarity": i.rarity,
                    "level": i.level,
                    "cards": i.cards,
                    "cards_need": i.cards_need
                } for i in profile_obj.items
            ],
            "items_count": len(profile_obj.items),

            "actual_version": profile_obj.app_version,
            "install_version": profile_obj.app_version,
            "profile_skins": game_data.get("Skins", {})
        }
    except Exception as e:
        print(f"--- API Error processing profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Failed to process profile: {str(e)}")


# 3. Подключение роутера к приложению
app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Backpack Insight API is running"}