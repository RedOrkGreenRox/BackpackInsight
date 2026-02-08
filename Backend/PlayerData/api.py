from typing import List

from fastapi import Depends, FastAPI
from sqlmodel import Session, select, text

# Import models
from Backend.PlayerData.models.Item import ItemDefinition
from Backend.PlayerData.services.ProfileFactory import ProfileFactory
from Backend.DB.database import engine, get_session

app = FastAPI(title="Backpack Insight API")

def create_indexes(engine):
    """Creates GIN indexes for trigram search if using PostgreSQL."""
    driver = engine.url.drivername
    print(f"--- API: DB Driver is '{driver}' ---")

    # Check for 'postgresql' OR 'postgres' in driver name
    if "postgres" not in driver:
        print("--- API: Skipping indexes (not PostgreSQL) ---")
        return

    print("--- API: Checking/Creating Indexes ---")
    with engine.connect() as conn:
        conn.commit()  # Ensure we are not in a failed transaction block
        try:
            # 1. Enable Extension (Idempotent)
            # We execute this separately and commit to ensure the operator class is available
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
            conn.commit()
            print("--- API: Extension 'pg_trgm' enabled ---")

            # 2. Create Indexes
            # Index for ItemDefinition.name
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_itemdefinition_name_trgm ON itemdefinition USING gin (name gin_trgm_ops);"
            ))

            # Index for ItemDefinition.item_id (FIXED: column name is item_id, not id)
            # Note: SQLModel uses the attribute name 'item_id' for the column by default,
            # even if alias='id' is set (alias is for Pydantic/JSON).
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_itemdefinition_id_trgm ON itemdefinition USING gin (item_id gin_trgm_ops);"
            ))

            conn.commit()
            print("--- API: Indexes created successfully ---")
        except Exception as e:
            print(f"--- API WARNING: Could not create indexes: {e}")
            # Try to print more info about the error
            import traceback
            traceback.print_exc()


@app.on_event("startup")
def on_startup():
    # Ensure tables exist
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

    # Create performance indexes
    create_indexes(engine)

    # Preload static data if needed
    with Session(engine) as session:
        existing = session.exec(select(ItemDefinition)).first()
        if not existing:
            print("--- API: Migrating Static Data ---")
            ProfileFactory.preload_definitions()
            # Use public accessor
            for def_obj in ProfileFactory.get_cached_definitions().values():
                session.add(def_obj)
            session.commit()


@app.get("/")
def read_root():
    return {"message": "Backpack Insight API is running"}


@app.get("/items", response_model=List[ItemDefinition])
def get_items(session: Session = Depends(get_session)):
    return session.exec(select(ItemDefinition)).all()
