import uvicorn
import json
import sys
import os
from typing import Optional, Union
from random import randint, choices
from pathlib import Path

from fastapi import FastAPI, Request, File, UploadFile, Form, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.gzip import GZipMiddleware  # Для сжатия данных
from fastapi.staticfiles import StaticFiles

# Настройка путей
BASE_DIR = Path(__file__).parent
SHARED_DIR = BASE_DIR / ".." / "Shared"
sys.path.insert(0, str(SHARED_DIR))

try:
    from Profile import Profile
except ImportError:
    # Заглушка, если класс Profile не найден в Shared
    class Profile:
        def __init__(self, data):
            self.game_information = data
            self.technical_information = {"AV": "1.0", "IV": "1.0"}

app = FastAPI()

app.add_middleware(GZipMiddleware, minimum_size=1000)


class MyStaticFiles(StaticFiles):
    def is_not_modified(self, response_headers, request_headers):
        # Отключаем кэширование полностью для разработки
        response_headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response_headers["Pragma"] = "no-cache"
        response_headers["Expires"] = "0"
        return super().is_not_modified(response_headers, request_headers)


app.mount("/static", MyStaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


# Главная страница
@app.get("/", response_class=HTMLResponse)
async def show_form(request: Request):
    bg = f"{randint(1, 20):02d}"
    return templates.TemplateResponse("main.html", {
        "request": request,
        "background_image": f"{bg}",
    })


# Страница рецептов (бывшая items)
@app.get("/recipes", response_class=HTMLResponse)
async def show_recipes(request: Request):
    bg = f"{randint(1, 20):02d}"
    
    # Загружаем предметы из JSON
    items_path = BASE_DIR / ".." / "jsons" / "items.json"
    items_data = []
    if items_path.exists():
        try:
            with open(items_path, "r", encoding="utf-8") as f:
                items_data = json.load(f)
        except Exception as e:
            print(f"Ошибка загрузки items.json: {e}")

    return templates.TemplateResponse("recipes.html", {
        "request": request,
        "background_image": f"{bg}",
        "items": items_data
    })


# Обработка глобальных ошибок
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Глобальная ошибка: {exc}")
    return RedirectResponse(url="/?error=true", status_code=303)


# Страница 404
@app.exception_handler(404)
async def not_found(request: Request, exc):
    rarity_weights = [80, 15, 4, 0.9, 0.1]
    rarity = choices([0, 1, 2, 3, 4], weights=rarity_weights, k=1)[0]
    bg_image = f"{rarity:02d}"
    return templates.TemplateResponse(
        "404.html", {
            "request": request,
            "background_image": bg_image
        }, status_code=404)


# Обработка профиля
@app.post("/profile", response_class=HTMLResponse)
async def profile(
        request: Request,
        json_text: Optional[str] = Form(None),
        json_file: Optional[UploadFile] = File(None)
):
    try:
        profile_data = None

        if json_text and json_text.strip():
            profile_data = json.loads(json_text)
        elif json_file and json_file.filename:
            content = await json_file.read()
            profile_data = json.loads(content)

        if not profile_data:
            raise ValueError("Данные не получены")

        profile_obj = Profile(profile_data)

        # Обработка героев
        heroes_data = []
        raw_heroes = profile_obj.game_information.get("Hero", [])
        for hero in raw_heroes:
            heroes_data.append({
                "name": hero.name if hasattr(hero, 'name') else hero.get('name'),
                "skin_num": '01',
                "level": hero.level if hasattr(hero, 'level') else hero.get('level', 0),
                "experience": hero.experience if hasattr(hero, 'experience') else hero.get('experience', 0),
                "exp_req": hero.exp_req if hasattr(hero, 'exp_req') else hero.get('exp_req', 0),
                "league": hero.league if hasattr(hero, 'league') else hero.get('league', 0),
                "rating": hero.rating if hasattr(hero, 'rating') else hero.get('rating', 0),
                "prestige": hero.prestige if hasattr(hero, 'prestige') else hero.get('prestige', 0)
            })

        # Сортировка: уровень + престиж (престиж дает +20 очков веса)
        heroes_data.sort(key=lambda h: (h['level'] + (20 if h['prestige'] else 0)), reverse=True)

        # Получаем скины из профиля
        profile_skins = profile_obj.game_information.get("Skins", {})

        context = {
            "request": request,
            "nickname": profile_obj.game_information.get("Nickname", "Герой"),
            "level": profile_obj.game_information.get("PlayerLevel", 1),
            "xp_total": profile_obj.game_information.get("PlayerExperienceTotal", 0),
            "xp_current": profile_obj.game_information.get("PlayerExperienceCurrent", 0),
            "xp_need": profile_obj.game_information.get("PlayerExperienceNeed", 100),
            "purchases": profile_obj.game_information.get("PH", 0),
            "trophy": profile_obj.game_information.get("Trophy", 0),
            "bonus_trophy": profile_obj.game_information.get("BonusTrophy", 0),
            "area": profile_obj.game_information.get("Area", "Unknown"),
            "background_image": f"{randint(1, 20):02d}",
            "coins": profile_obj.game_information.get("Currency", {}).get("coins", 0),
            "gems": profile_obj.game_information.get("Currency", {}).get("gems", 0),
            "heroes": heroes_data,
            "items": profile_obj.game_information.get("Item", []),
            "item_stats": profile_obj.game_information.get("ItemStats", {}),
            "heroes_count": len(heroes_data),
            "items_count": len(profile_obj.game_information.get("Item", [])),
            "actual_version": profile_obj.technical_information.get("AV", "1.0"),
            "install_version": profile_obj.technical_information.get("IV", "1.0"),
            "profile_skins": profile_skins, # Передаем скины из профиля
        }
        return templates.TemplateResponse("profile.html", context)

    except Exception as e:
        print(f"Ошибка парсинга: {e}")
        return templates.TemplateResponse("main.html", {
            "request": request,
            "error": "Неверный формат JSON файла",
            "background_image": f"{randint(1, 20):02d}"
        })


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5080,
        reload=True,
    )
