import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

# Load .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

# --- Configuration ---
# Read from environment variables (defaults match docker-compose)
POSTGRES_USER = os.getenv("POSTGRES_USER", "admin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "secret")
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost") # Use localhost to connect from host
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "backpack_insight")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

def verify():
    print(f"Connecting to: {DATABASE_URL} ...")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("Connection successful!")

            # 1. Check Extension
            print("\nChecking for pg_trgm extension...")
            result = conn.execute(text("SELECT * FROM pg_extension WHERE extname = 'pg_trgm';")).fetchone()
            if result:
                print("   Extension 'pg_trgm' is INSTALLED.")
            else:
                print("   Extension 'pg_trgm' is MISSING!")

            # 2. Check Indexes (Relaxed check)
            print("\nChecking for indexes on 'itemdefinition'...")
            query = text("""
                SELECT indexname, indexdef 
                FROM pg_indexes 
                WHERE tablename = 'itemdefinition';
            """)
            indexes = conn.execute(query).fetchall()
            
            gin_found = False
            if indexes:
                print(f"   Found {len(indexes)} indexes total:")
                for idx in indexes:
                    name = idx.indexname
                    definition = idx.indexdef
                    is_gin = "gin" in definition.lower()
                    icon = "[GIN]" if is_gin else "[BTREE]"
                    print(f"      {icon} {name}: {definition}")
                    if is_gin:
                        gin_found = True
                
                if not gin_found:
                     print("\n   No GIN indexes found among them. Search might be slow.")
            else:
                print("   No indexes found at all!")

            # 3. Test Search
            print("\nTesting Search Query...")
            try:
                # Force use of index logic if possible, though EXPLAIN is hard to parse programmatically
                search_res = conn.execute(text(
                    "SELECT name FROM itemdefinition WHERE name ILIKE '%Sword%' LIMIT 1;"
                )).fetchall()
                print(f"   Query executed successfully. Found: {search_res}")
            except Exception as e:
                print(f"   Query failed: {e}")

    except Exception as e:
        print("\nCRITICAL ERROR: Could not connect to database.")
        print(f"   Details: {e}")
        print("   Make sure Docker is running: 'docker-compose up -d'")

if __name__ == "__main__":
    verify()
