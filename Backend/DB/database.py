import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import create_engine, Session

# Load .env file using python-dotenv
# Универсальный поиск .env файла - работает везде
def find_env_file():
    current_file = Path(__file__).resolve()
    
    # Ищем .env в текущей директории и вверх по дереву
    search_paths = [
        current_file.parent / ".env",           # Backend/DB/.env
        current_file.parent.parent / ".env",    # Backend/.env  
        current_file.parent.parent.parent / ".env"  # Корень проекта
    ]
    
    for env_path in search_paths:
        if env_path.exists():
            print(f"--- Found .env at: {env_path}")
            return env_path
    
    print("--- WARNING: .env file not found, using defaults")
    return None

env_file = find_env_file()
if env_file:
    load_dotenv(env_file)

# -- Configuration --
# Security: Use environment variables with safe defaults for dev, but require explicit values in prod
POSTGRES_USER = os.getenv("POSTGRES_USER", "admin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "secret")
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "backpack_insight")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

USE_SQLITE = os.getenv("USE_SQLITE", "False").lower() == "true"

def get_sqlite_url():
    # Backend/DB/database.py -> Backend/DB -> Backend -> BackpackInsight (Root)
    current_dir = Path(__file__).resolve().parent
    project_root = current_dir.parent.parent
    sqlite_path = project_root / "Frontend" / "Web" / "database.db"
    return f"sqlite:///{sqlite_path}"

if USE_SQLITE:
    DATABASE_URL = get_sqlite_url()
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"--- DB: Using SQLite ({DATABASE_URL}) ---")
else:
    try:
        engine = create_engine(DATABASE_URL)
        print(f"--- DB: Using PostgreSQL ({POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}) ---")
    except Exception as e:
        print(f"--- DB ERROR: Could not configure PostgreSQL engine: {e}")
        print("--- DB: Falling back to SQLite ---")
        DATABASE_URL = get_sqlite_url()
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def get_session():
    with Session(engine) as session:
        yield session
