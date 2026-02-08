import os
import sys
from sqlmodel import SQLModel, create_engine, text

# --- 1. Setup Paths ---
# Add project root to path to allow imports if needed
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, project_root)

from Backend.DB.database import DATABASE_URL

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
            from Backend.PlayerData.models.Profile import Profile
            from Backend.PlayerData.models.Item import Item, ItemDefinition
            from Backend.PlayerData.models.Hero import Hero
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
