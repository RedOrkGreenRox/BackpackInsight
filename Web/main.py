import uvicorn
import json
import sys
import os
from typing import Optional, List
from random import randint, choices
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, File, UploadFile, Form, status, Depends, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from sqlmodel import SQLModel, create_engine, Session, select

# -- 1. Setup Paths & Imports --
BASE_DIR = Path(__file__).parent
# Обновленный путь к бэкенду
BACKEND_DIR = BASE_DIR / ".." / "Backend" / "Profile"
sys.path.insert(0, str(BACKEND_DIR))

try:
    from Profile import Profile
    from ProfileFactory import ProfileFactory
    from Item import Item, ItemDefinition
    from Search import search_items
    from data import ITEMS
except ImportError as e:
    print(f"CRITICAL ERROR: Could not import Backend modules: {e}")
    sys.exit(1)

# -- 2. Database Setup --
# Используем файл для сохранения данных между перезапусками
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def get_session():
    with Session(engine) as session:
        yield session

# -- 3. App Lifecycle --
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Init DB and Load Static Data
    print("--- STARTUP: Initializing Database ---")
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Проверяем, есть ли уже данные в базе
        existing = session.exec(select(ItemDefinition)).first()
        
        if not existing:
            print("--- STARTUP: Migrating Static Data to DB ---")
            # 1. Загружаем в кэш из JSON
            ProfileFactory.preload_definitions() 
            
            # 2. Сохраняем в БД
            for def_obj in ProfileFactory._definition_cache.values():
                session.add(def_obj)
            session.commit()
            print(f"--- STARTUP: Migrated {len(ProfileFactory._definition_cache)} items ---")
            
            # 3. Очищаем кэш, так как объекты в нем теперь привязаны к закрывающейся сессии
            ProfileFactory._definition_cache.clear()
            
            # 4. Перезагружаем кэш "чистыми" объектами (detached)
            print("--- STARTUP: Refreshing Cache with Detached Objects ---")
            ProfileFactory.preload_definitions(session)
            
        else:
            print("--- STARTUP: DB already contains data ---")
            # Загружаем кэш из БД, объекты будут detached благодаря фиксу в Factory
            ProfileFactory.preload_definitions(session)
            print(f"--- STARTUP: {len(ProfileFactory._definition_cache)} items cached ---")
            
    yield
    print("--- SHUTDOWN ---")

app = FastAPI(lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# -- 4. Static Files & Templates --
class MyStaticFiles(StaticFiles):
    def is_not_modified(self, response_headers, request_headers):
        # Отключаем кэширование для разработки
        response_headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        return super().is_not_modified(response_headers, request_headers)

app.mount("/static", MyStaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# -- 5. Routes --

@app.get("/", response_class=HTMLResponse)
async def show_form(request: Request):
    bg = f"{randint(1, 20):02d}"
    return templates.TemplateResponse("main.html", {
        "request": request,
        "background_image": f"{bg}",
    })

@app.get("/items", response_class=HTMLResponse)
async def show_recipes(request: Request, session: Session = Depends(get_session)):
    bg = f"{randint(1, 20):02d}"
    
    # Берем данные из БД (Single Source of Truth)
    definitions = session.exec(select(ItemDefinition)).all()
    
    return templates.TemplateResponse("items.html", {
        "request": request,
        "background_image": f"{bg}",
        "items": definitions
    })

@app.get("/api/search")
async def search_api(
    q: str, 
    scope: Optional[str] = Query(None, description="Search scope: 'static', 'dynamic', or null for both"),
    session: Session = Depends(get_session)
):
    """
    API endpoint for fuzzy search.
    Supports scope filtering.
    """
    if not q or len(q) < 2:
        return []
    
    # Преобразуем строковый scope в список для функции search_items
    search_scope = None
    if scope == "static":
        search_scope = ["static"]
    elif scope == "dynamic":
        search_scope = ["dynamic"]
    
    results = search_items(session, q, limit=10, scope=search_scope)
    
    # Форматируем ответ для фронтенда
    response = []
    for obj, score, type_str in results:
        # Определяем URL картинки
        image_url = f"/static/images/items/webp/{obj.name}.webp"
        
        response.append({
            "name": obj.name,
            "rarity": obj.rarity,
            "type": type_str,
            "score": round(score, 2),
            "image_url": image_url,
            "level": getattr(obj, "level", None) # Level есть только у Item, не у Definition
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

        # 1. Создаем объект профиля через Фабрику
        # Это автоматически распарсит героев и предметы, используя кэшированные определения
        profile_obj = Profile.from_json(profile_data)
        
        # 2. (Опционально) Сохраняем в БД
        # Если вы хотите, чтобы загруженные профили сохранялись и участвовали в поиске:
        # session.add(profile_obj)
        # session.commit()
        # session.refresh(profile_obj)

        # 3. Подготовка данных для шаблона
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
        
        # Сортировка героев
        heroes_data.sort(key=lambda h: (h['level'] + (20 if h['prestige'] else 0)), reverse=True)

        context = {
            "request": request,
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
            "items": profile_obj.items, # Передаем объекты SQLModel напрямую
            "item_stats": profile_obj.game_information.ItemStats,
            "heroes_count": len(heroes_data),
            "items_count": len(profile_obj.items),
            "actual_version": profile_obj.app_version or "1.0",
            "install_version": profile_obj.technical_information.IV or "1.0",
            "profile_skins": profile_obj.game_information.Skins,
        }
        return templates.TemplateResponse("profile.html", context)

    except Exception as e:
        print(f"Profile Parsing Error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(url="/?error=json_error", status_code=status.HTTP_303_SEE_OTHER)

# -- 6. Error Handlers --
@app.exception_handler(404)
async def not_found(request: Request, exc):
    rarity_weights = [80, 15, 4, 0.9, 0.1]
    rarity = choices([0, 1, 2, 3, 4], weights=rarity_weights, k=1)[0]
    return templates.TemplateResponse(
        "404.html", {
            "request": request,
            "background_image": f"{rarity:02d}"
        }, status_code=404)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5080, reload=True)
