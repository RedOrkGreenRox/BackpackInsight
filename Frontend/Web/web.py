import json
import os
import sys
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from random import choices, randint
from typing import Optional

import uvicorn
from fastapi import Depends, FastAPI, File, Form, Query, Request, UploadFile, status
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, SQLModel, create_engine, desc, select

# -- 1. Setup Paths & Imports --
BASE_DIR = Path(__file__).resolve().parent
# Removed sys.path.insert hack.
# Imports now rely on PYTHONPATH being set correctly (e.g. in Docker or IDE)

try:
    # Absolute imports from the project root
    from Backend.PlayerData.data import ITEMS
    from Backend.PlayerData.models.Item import Item, ItemDefinition
    from Backend.PlayerData.models.Profile import Profile
    from Backend.PlayerData.services.ProfileFactory import ProfileFactory
    from Backend.PlayerData.services.Search import search_items

except ImportError as e:
    print(f"CRITICAL ERROR: Could not import Backend modules: {e}")
    print("Ensure project root is in PYTHONPATH.")
    traceback.print_exc()
    sys.exit(1)

# -- 2. Database Setup --
# По умолчанию используем PostgreSQL из Docker
# Если переменные окружения не заданы, используем дефолтные значения из docker-compose.yml
POSTGRES_USER = os.getenv("POSTGRES_USER", "admin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "secret")
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "backpack_insight")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Fallback to SQLite if Postgres is not configured or we want local dev without docker
USE_SQLITE = os.getenv("USE_SQLITE", "False").lower() == "true"

if USE_SQLITE:
    sqlite_file_name = "database.db"
    DATABASE_URL = f"sqlite:///{sqlite_file_name}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"--- DB: Using SQLite ({sqlite_file_name}) ---")
else:
    # Для PostgreSQL check_same_thread не нужен
    try:
        engine = create_engine(DATABASE_URL)
        print(f"--- DB: Using PostgreSQL ({POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}) ---")
    except Exception as e:
        print(f"--- DB ERROR: Could not connect to PostgreSQL: {e}")
        print("--- DB: Falling back to SQLite ---")
        sqlite_file_name = "database.db"
        DATABASE_URL = f"sqlite:///{sqlite_file_name}"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def get_session():
    with Session(engine) as session:
        yield session


# -- 3. App Lifecycle --
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- STARTUP: Initializing Database ---")
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"--- STARTUP ERROR: Could not create tables: {e}")
        # Если не удалось подключиться к Postgres при старте, приложение может упасть или работать некорректно.
        # В продакшене здесь лучше упасть, но для разработки можно попробовать продолжить.

    with Session(engine) as session:
        # Проверяем, есть ли уже данные в базе
        try:
            existing = session.exec(select(ItemDefinition)).first()

            if not existing:
                print("--- STARTUP: Migrating Static Data to DB ---")
                ProfileFactory.preload_definitions()

                for def_obj in ProfileFactory.get_cached_definitions().values():
                    session.add(def_obj)
                session.commit()
                print(f"--- STARTUP: Migrated {len(ProfileFactory.get_cached_definitions())} items ---")

                ProfileFactory.clear_cache()

                print("--- STARTUP: Refreshing Cache with Detached Objects ---")
                ProfileFactory.preload_definitions(session)

            else:
                print("--- STARTUP: DB already contains data ---")
                ProfileFactory.preload_definitions(session)
                print(f"--- STARTUP: {len(ProfileFactory.get_cached_definitions())} items cached ---")
        except Exception as e:
            print(f"--- STARTUP ERROR: Database interaction failed: {e}")

    yield
    print("--- SHUTDOWN ---")


app = FastAPI(lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# -- 4. Static Files & Templates --
class MyStaticFiles(StaticFiles):
    # Флаг для управления кэшированием (True = кэшировать, False = не кэшировать)
    ENABLE_CACHE = True

    def is_not_modified(self, response_headers, request_headers):
        if not self.ENABLE_CACHE:
            # Отключаем кэширование для разработки
            response_headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        else:
            # Включаем стандартное кэширование (например, на 1 час)
            response_headers["Cache-Control"] = "public, max-age=3600"

        return super().is_not_modified(response_headers, request_headers)


app.mount("/static", MyStaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


# -- 5. Routes --

@app.get("/", response_class=HTMLResponse)
async def show_form(request: Request, error: Optional[str] = None):
    bg = f"{randint(1, 20):02d}"
    
    # Map error codes to user-friendly messages
    error_message = None
    if error == "json_error":
        error_message = "Ошибка: Некорректный формат файла или данные повреждены."
    elif error:
        error_message = f"Ошибка: {error}"

    return templates.TemplateResponse(request, "main.html", {
        "background_image": f"{bg}",
        "error": error_message
    })


@app.get("/items", response_class=HTMLResponse)
async def show_recipes(request: Request, session: Session = Depends(get_session)):
    bg = f"{randint(1, 20):02d}"

    definitions = session.exec(select(ItemDefinition)).all()

    return templates.TemplateResponse(request, "items.html", {
        "background_image": f"{bg}",
        "items": definitions
    })


@app.get("/api/search")
async def search_api(
        q: str,
        scope: Optional[str] = Query(None, description="Search scope: 'static', 'dynamic', or null for both"),
        session: Session = Depends(get_session)
):
    if not q or len(q) < 2:
        return []

    search_scope = None
    if scope == "static":
        search_scope = ["static"]
    elif scope == "dynamic":
        search_scope = ["dynamic"]

    results = search_items(session, q, limit=10, scope=search_scope)

    response = []
    for obj, score, type_str in results:
        image_url = f"/static/images/items/webp/{obj.name}.webp"

        response.append({
            "name": obj.name,
            "rarity": obj.rarity,
            "type": type_str,
            "score": round(score, 2),
            "image_url": image_url,
            "level": getattr(obj, "level", None)
        })
    return response


@app.post("/profile", response_class=HTMLResponse)
async def profile(
        request: Request,
        json_text: Optional[str] = Form(None),
        json_file: Optional[UploadFile] = File(None),
        session: Session = Depends(get_session)
):
    try:
        profile_data = None
        if json_text and json_text.strip():
            profile_data = json.loads(json_text)
        elif json_file and json_file.filename:
            content = await json_file.read()
            profile_data = json.loads(content)

        if not profile_data:
            raise ValueError("No data received")

        # 1. Parse the new profile
        new_profile = Profile.from_json(profile_data)
        user_id = new_profile.user_id

        # 2. Check for existing profiles with the same UID
        if user_id:
            # Fetch existing profiles for this user, ordered by ID (assuming ID increments with time)
            # We use ID as a proxy for creation time since we don't have a created_at column yet
            existing_profiles = session.exec(
                select(Profile)
                .where(Profile.user_id == user_id)
                .order_by(desc(Profile.pk))
            ).all()

            if existing_profiles:
                latest_profile = existing_profiles[0]

                # Compare critical data to see if it's a duplicate upload
                # We compare the raw JSON blobs stored in the DB
                is_duplicate = (
                        latest_profile.game_info_data == new_profile.game_info_data and
                        latest_profile.technical_info_data == new_profile.technical_info_data
                )

                if is_duplicate:
                    print(f"--- Profile Upload: Duplicate detected for UID {user_id}. Using existing. ---")
                    # Use the existing profile instead of saving a new one
                    profile_obj = latest_profile
                else:
                    # It's a new update. Check history limit.
                    # If we already have 3 or more, we need to delete the oldest ones to make room.
                    # We want to keep at most 2 old ones + 1 new one = 3 total.
                    if len(existing_profiles) >= 3:
                        # Profiles to delete: everything from index 2 onwards (keep 0 and 1)
                        # Because we are adding a new one, we only want to keep the 2 most recent existing.
                        profiles_to_delete = existing_profiles[2:]
                        for p in profiles_to_delete:
                            session.delete(p)
                        print(
                            f"--- Profile Upload: Rotated history. Deleted {len(profiles_to_delete)} old profiles. ---")

                    session.add(new_profile)
                    session.commit()
                    session.refresh(new_profile)
                    profile_obj = new_profile
            else:
                # First time seeing this user
                session.add(new_profile)
                session.commit()
                session.refresh(new_profile)
                profile_obj = new_profile
        else:
            # No UID found (rare), just save it
            session.add(new_profile)
            session.commit()
            session.refresh(new_profile)
            profile_obj = new_profile

        heroes_data = []
        for hero in profile_obj.heroes:
            heroes_data.append({
                "name": hero.name,
                "skin_num": '01',
                "level": hero.level,
                "experience": hero.experience,
                "exp_req": hero.exp_req,
                "league": hero.league,
                "rating": hero.rating,
                "prestige": hero.prestige
            })

        heroes_data.sort(key=lambda h: (h['level'] + (20 if h['prestige'] else 0)), reverse=True)

        context = {
            "nickname": profile_obj.nickname or "Hero",
            "level": profile_obj.level,
            "xp_total": profile_obj.total_xp,
            "xp_current": profile_obj.game_information.PlayerExperienceCurrent,
            "xp_need": profile_obj.game_information.PlayerExperienceNeed,
            "purchases": len(profile_obj.game_information.PH),
            "trophy": profile_obj.trophies,
            "bonus_trophy": profile_obj.game_information.BonusTrophy,
            "area": profile_obj.game_information.Area,
            "background_image": f"{randint(1, 20):02d}",
            "coins": profile_obj.coins,
            "gems": profile_obj.gems,
            "heroes": heroes_data,
            "items": profile_obj.items,
            "item_stats": profile_obj.game_information.ItemStats,
            "heroes_count": len(heroes_data),
            "items_count": len(profile_obj.items),
            "actual_version": profile_obj.app_version or "1.0",
            "install_version": profile_obj.technical_information.IV or "1.0",
            "profile_skins": profile_obj.game_information.Skins,
        }
        return templates.TemplateResponse(request, "profile.html", context)

    except Exception as e:
        print(f"Profile Parsing Error: {e}")
        traceback.print_exc()
        return RedirectResponse(url="/?error=json_error", status_code=status.HTTP_303_SEE_OTHER)


# -- 6. Error Handlers --
@app.exception_handler(404)
async def not_found(request: Request, exc):
    rarity_weights = [80, 15, 4, 0.9, 0.1]
    rarity = choices([0, 1, 2, 3, 4], weights=rarity_weights, k=1)[0]
    return templates.TemplateResponse(request, "404.html", {
        "background_image": f"{rarity:02d}"
    }, status_code=404)


if __name__ == "__main__":
    # ВАЖНО: host="0.0.0.0" нужен для доступа извне контейнера
    uvicorn.run("web:app", host="0.0.0.0", port=5080, reload=True)
