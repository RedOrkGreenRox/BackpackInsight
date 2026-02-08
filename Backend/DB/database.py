import os
from pathlib import Path
from sqlmodel import create_engine, Session

# -- Configuration --
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
