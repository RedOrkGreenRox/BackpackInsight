import json
import os
import sys
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from random import choices, randint
from typing import Optional, List, Dict, Any

import httpx
import uvicorn
from fastapi import FastAPI, File, Form, Query, Request, UploadFile, status
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# -- 1. Setup Paths & Config --
BASE_DIR = Path(__file__).resolve().parent
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://backpack_insight_backend:8000")

# -- 2. App Lifecycle --
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"--- STARTUP: Connecting to Backend at {BACKEND_API_URL} ---")
    # Initialize a shared HTTP client
    timeout = httpx.Timeout(10.0, read=30.0)
    app.state.http_client = httpx.AsyncClient(base_url=BACKEND_API_URL, timeout=timeout)
    
    yield
    
    print("--- SHUTDOWN: Closing HTTP Client ---")
    await app.state.http_client.aclose()

app = FastAPI(lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# -- 3. Static Files & Templates --
class MyStaticFiles(StaticFiles):
    ENABLE_CACHE = False

    def is_not_modified(self, response_headers, request_headers):
        if not self.ENABLE_CACHE:
            response_headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        else:
            response_headers["Cache-Control"] = "public, max-age=3600"

        return super().is_not_modified(response_headers, request_headers)


# Serve JS/CSS directly from templates folder to match physical structure
@app.get("/templates/{file_path:path}")
async def serve_templates(file_path: str):
    # Security: Prevent directory traversal
    if ".." in file_path:
        return HTMLResponse(status_code=404)

    full_path = BASE_DIR / "templates" / file_path
    
    # Security: Ensure we are still within the templates directory
    try:
        full_path.relative_to(BASE_DIR / "templates")
    except ValueError:
        return HTMLResponse(status_code=404)

    if full_path.exists() and full_path.is_file():
        suffix = full_path.suffix.lower()
        if suffix == ".js":
            return FileResponse(full_path, media_type="application/javascript")
        elif suffix == ".css":
            return FileResponse(full_path, media_type="text/css")
        elif suffix == ".map":
            return FileResponse(full_path, media_type="application/json")
    
    return HTMLResponse(status_code=404)


app.mount("/static", MyStaticFiles(directory=str(BASE_DIR / "static")), name="static")

# Mount dist folder for compiled assets
# Check for Docker build path first (outside bind mount)
docker_dist = Path("/app/dist_build")
local_dist = BASE_DIR / "dist"

dist_dir = docker_dist if docker_dist.exists() else local_dist
print(f"--- Serving dist from: {dist_dir} ---")

if dist_dir.exists():
    app.mount("/dist", MyStaticFiles(directory=str(dist_dir)), name="dist")
else:
    print(f"WARNING: Dist directory not found at {dist_dir}")

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
    elif error == "backend_error":
        error_message = "Ошибка: Сервер данных недоступен."
    elif error:
        error_message = f"Ошибка: {error}"

    return templates.TemplateResponse(request, "branches/main/main.html", {
        "background_image": f"{bg}",
        "error": error_message
    })


@app.get("/items", response_class=HTMLResponse)
async def show_recipes(request: Request):
    bg = f"{randint(1, 20):02d}"
    client: httpx.AsyncClient = request.app.state.http_client

    try:
        # Request items from Backend API
        response = await client.get("/api/items")
        response.raise_for_status()
        definitions = response.json()
    except Exception as e:
        print(f"Error fetching items: {e}")
        definitions = []

    return templates.TemplateResponse(request, "branches/items/items.html", {
        "background_image": f"{bg}",
        "items": definitions
    })


@app.get("/api/search")
async def search_api(
        request: Request,
        q: str,
        scope: Optional[str] = Query(None, description="Search scope: 'static', 'dynamic', or null for both")
):
    if not q or len(q) < 2:
        return []

    client: httpx.AsyncClient = request.app.state.http_client
    
    try:
        params = {"q": q}
        if scope:
            params["scope"] = scope
            
        response = await client.get("/api/search", params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error searching items: {e}")
        return []


@app.post("/profile", response_class=HTMLResponse)
async def profile(
        request: Request,
        json_text: Optional[str] = Form(None),
        json_file: Optional[UploadFile] = File(None)
):
    try:
        # 1. Extract JSON data
        profile_data = None
        if json_text and json_text.strip():
            try:
                profile_data = json.loads(json_text)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON text")
        elif json_file and json_file.filename:
            content = await json_file.read()
            try:
                profile_data = json.loads(content)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON file")

        if not profile_data:
            raise ValueError("No data received")

        # 2. Send to Backend for processing
        client: httpx.AsyncClient = request.app.state.http_client
        
        # We send the raw profile JSON to the backend. 
        # The backend is responsible for parsing, saving to DB, and returning the view context.
        response = await client.post("/api/profile", json=profile_data)
        
        if response.status_code != 200:
            print(f"Backend returned error: {response.status_code} - {response.text}")
            return RedirectResponse(url="/?error=json_error", status_code=status.HTTP_303_SEE_OTHER)

        # 3. Render template with data from Backend
        context = response.json()
        
        # Ensure background image is present if backend didn't provide it
        if "background_image" not in context:
            context["background_image"] = f"{randint(1, 20):02d}"
            
        return templates.TemplateResponse(request, "branches/profile/profile.html", context)

    except ValueError:
        return RedirectResponse(url="/?error=json_error", status_code=status.HTTP_303_SEE_OTHER)
    except httpx.RequestError as e:
        print(f"Backend connection error: {e}")
        return RedirectResponse(url="/?error=backend_error", status_code=status.HTTP_303_SEE_OTHER)
    except Exception as e:
        print(f"Profile Processing Error: {e}")
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
