import json
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from random import choices, randint
from typing import Optional

import uvicorn
from fastapi import Depends, FastAPI, File, Form, Query, Request, UploadFile, status
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, SQLModel, desc, select

# -- 1. Setup Paths & Imports --
BASE_DIR = Path(__file__).resolve().parent

try:
    # Absolute imports from the project root
    from Backend.PlayerData.models.Item import ItemDefinition
    from Backend.PlayerData.models.Profile import Profile
    from Backend.PlayerData.services.ProfileFactory import ProfileFactory
    from Backend.PlayerData.services.Search import search_items
    from Backend.DB.database import engine, get_session

except ImportError as e:
    print(f"CRITICAL ERROR: Could not import Backend modules: {e}")
    print("Ensure project root is in PYTHONPATH.")
    traceback.print_exc()
    sys.exit(1)

# -- 2. App Lifecycle --
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- STARTUP: Initializing Database ---")
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"--- STARTUP ERROR: Could not create tables: {e}")

    with Session(engine) as session:
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


# -- 3. Static Files & Templates --
class MyStaticFiles(StaticFiles):
    ENABLE_CACHE = True

    def is_not_modified(self, response_headers, request_headers):
        if not self.ENABLE_CACHE:
            response_headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        else:
            response_headers["Cache-Control"] = "public, max-age=3600"

        return super().is_not_modified(response_headers, request_headers)


@app.get("/static/js/{file_path:path}")
async def serve_js(file_path: str):
    # 1. Direct check in roots (e.g. /static/js/base.js)
    roots_path = BASE_DIR / "templates" / "roots" / file_path
    if roots_path.exists() and roots_path.is_file():
        return FileResponse(roots_path, media_type="application/javascript")

    # 2. Direct check in branches (e.g. /static/js/profile/skins.js -> templates/branches/profile/skins.js)
    branches_path = BASE_DIR / "templates" / "branches" / file_path
    if branches_path.exists() and branches_path.is_file():
        return FileResponse(branches_path, media_type="application/javascript")

    # 3. Fallback: Search for filename in any branch folder (flat search for backward compatibility)
    # This handles cases where we request /static/js/main.js but it lives in templates/branches/main/main.js
    filename = Path(file_path).name
    branches_dir = BASE_DIR / "templates" / "branches"
    if branches_dir.exists():
        for branch in branches_dir.iterdir():
            if branch.is_dir():
                potential_path = branch / filename
                if potential_path.exists() and potential_path.is_file():
                    return FileResponse(potential_path, media_type="application/javascript")
    
    return HTMLResponse(status_code=404)


@app.get("/static/css/{file_path:path}")
async def serve_css(file_path: str):
    # Same logic as JS
    roots_path = BASE_DIR / "templates" / "roots" / file_path
    if roots_path.exists() and roots_path.is_file():
        return FileResponse(roots_path, media_type="text/css")

    branches_path = BASE_DIR / "templates" / "branches" / file_path
    if branches_path.exists() and branches_path.is_file():
        return FileResponse(branches_path, media_type="text/css")

    filename = Path(file_path).name
    branches_dir = BASE_DIR / "templates" / "branches"
    if branches_dir.exists():
        for branch in branches_dir.iterdir():
            if branch.is_dir():
                potential_path = branch / filename
                if potential_path.exists() and potential_path.is_file():
                    return FileResponse(potential_path, media_type="text/css")
    
    return HTMLResponse(status_code=404)


app.mount("/static", MyStaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Helper to get CSS content for embedding
def get_css(filename: str):
    # Check roots
    path = BASE_DIR / "templates" / "roots" / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    
    # Check branches
    branches_dir = BASE_DIR / "templates" / "branches"
    if branches_dir.exists():
        for branch in branches_dir.iterdir():
            if branch.is_dir():
                path = branch / filename
                if path.exists():
                    return path.read_text(encoding="utf-8")
    return ""

templates.env.globals['get_css'] = get_css


# -- 4. Routes --

@app.get("/", response_class=HTMLResponse)
async def show_form(request: Request, error: Optional[str] = None):
    bg = f"{randint(1, 20):02d}"
    
    error_message = None
    if error == "json_error":
        error_message = "Ошибка: Некорректный формат файла или данные повреждены."
    elif error:
        error_message = f"Ошибка: {error}"

    return templates.TemplateResponse(request, "branches/main/main.html", {
        "background_image": f"{bg}",
        "error": error_message
    })


@app.get("/items", response_class=HTMLResponse)
async def show_recipes(request: Request, session: Session = Depends(get_session)):
    bg = f"{randint(1, 20):02d}"

    definitions = session.exec(select(ItemDefinition)).all()

    return templates.TemplateResponse(request, "branches/items/items.html", {
        "background_image": f"{bg}",
        "items": definitions
    })


@app.get("/api/search")
def search_api(
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
def profile(
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
            content = json_file.file.read()
            profile_data = json.loads(content)

        if not profile_data:
            raise ValueError("No data received")

        new_profile = Profile.from_json(profile_data)
        user_id = new_profile.user_id

        if user_id:
            existing_profiles = session.exec(
                select(Profile)
                .where(Profile.user_id == user_id)
                .order_by(desc(Profile.pk))
            ).all()

            if existing_profiles:
                latest_profile = existing_profiles[0]

                is_duplicate = (
                        latest_profile.game_info_data == new_profile.game_info_data and
                        latest_profile.technical_info_data == new_profile.technical_info_data
                )

                if is_duplicate:
                    print(f"--- Profile Upload: Duplicate detected for UID {user_id}. Using existing. ---")
                    profile_obj = latest_profile
                else:
                    if len(existing_profiles) >= 3:
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
                session.add(new_profile)
                session.commit()
                session.refresh(new_profile)
                profile_obj = new_profile
        else:
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
        return templates.TemplateResponse(request, "branches/profile/profile.html", context)

    except Exception as e:
        print(f"Profile Parsing Error: {e}")
        traceback.print_exc()
        return RedirectResponse(url="/?error=json_error", status_code=status.HTTP_303_SEE_OTHER)


@app.exception_handler(404)
async def not_found(request: Request, exc):
    rarity_weights = [80, 15, 4, 0.9, 0.1]
    rarity = choices([0, 1, 2, 3, 4], weights=rarity_weights, k=1)[0]
    return templates.TemplateResponse(request, "branches/404/404.html", {
        "background_image": f"{rarity:02d}"
    }, status_code=404)


if __name__ == "__main__":
    uvicorn.run("web:app", host="0.0.0.0", port=5080, reload=True)
