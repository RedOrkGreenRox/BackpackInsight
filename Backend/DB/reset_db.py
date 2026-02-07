import os
import sys
from sqlmodel import SQLModel, create_engine, text

# --- 1. Setup Paths ---
# Add project root to path to allow imports if needed
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, project_root)

# --- 2. Configuration ---
# Read from environment variables (compatible with Docker and local .env)
POSTGRES_USER = os.getenv("POSTGRES_USER", "admin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "secret")
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "backpack_insight")

# Construct Database URL
DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Check for SQLite override
USE_SQLITE = os.getenv("USE_SQLITE", "False").lower() == "true"
if USE_SQLITE:
    sqlite_file_name = "database.db"
    # Adjust path to be relative to where the script is run or absolute
    db_path = os.path.join(project_root, "Frontend", "Web", sqlite_file_name)
    DATABASE_URL = f"sqlite:///{db_path}"
    print(f"Target: SQLite ({db_path})")
else:
    print(f"Target: PostgreSQL ({POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB})")

def reset_database():
    print("\n⚠️  WARNING: THIS WILL DELETE ALL DATA IN THE DATABASE! ⚠️")
    print(f"Connection: {DATABASE_URL}")
    
    confirm = input("Type 'DELETE' to confirm: ")
    if confirm != "DELETE":
        print("Operation cancelled.")
        return

    try:
        engine = create_engine(DATABASE_URL)
        
        # Option 1: Drop all tables defined in SQLModel metadata
        # Note: This requires importing all models so they are registered in metadata.
        # If models are not imported, drop_all won't know about them.
        
        print("Importing models to register metadata...")
        try:
            # Absolute imports from project root
            from Backend.PlayerData.Profile import Profile
            from Backend.PlayerData.Item import Item, ItemDefinition
            from Backend.PlayerData.Hero import Hero
            print("Models imported successfully.")
        except ImportError as e:
            print(f"Error importing models: {e}")
            print("Falling back to raw SQL drop (PostgreSQL only)...")
            
            # Fallback for Postgres: Drop public schema
            if "postgresql" in DATABASE_URL:
                with engine.connect() as conn:
                    conn.execute(text("DROP SCHEMA public CASCADE;"))
                    conn.execute(text("CREATE SCHEMA public;"))
                    conn.commit()
                print("✅ Public schema recreated (All tables dropped).")
                return

        print("Dropping tables via SQLModel...")
        SQLModel.metadata.drop_all(engine)
        print("✅ All tables dropped successfully.")
        
        print("Recreating tables...")
        SQLModel.metadata.create_all(engine)
        print("✅ Tables recreated (Empty).")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reset_database()
