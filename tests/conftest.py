import sys
import os
import pytest
from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient

# --- 1. Path Setup ---
# We still need to add Frontend/Web to sys.path because 'web.py' is not a package
# But Backend is now imported as a package from root
ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT_DIR / "Frontend" / "Web"

# Add root dir to sys.path to allow 'from Backend...' imports
sys.path.insert(0, str(ROOT_DIR))
# Add Web dir to allow 'from web import app'
sys.path.insert(0, str(WEB_DIR))

# --- 2. Imports ---
try:
    from web import app, get_session
    from Backend.PlayerData.models.Item import ItemDefinition
    from Backend.PlayerData.services.ProfileFactory import ProfileFactory
except ImportError as e:
    raise ImportError(f"Could not import project modules. Check paths: {e}")

# --- 3. Database Fixtures ---

@pytest.fixture(name="session")
def session_fixture():
    """
    Creates an in-memory SQLite database for testing.
    Uses StaticPool to share the same in-memory DB across threads.
    """
    # Use StaticPool so the data persists across multiple connections in the same test process
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False}, 
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    
    # Clear Factory Cache to prevent DetachedInstanceError from previous tests
    ProfileFactory.clear_cache()
    
    # Preload static data (Items)
    with Session(engine) as session:
        ProfileFactory.preload_definitions()
        # Use public accessor
        for def_obj in ProfileFactory.get_cached_definitions().values():
            # We add them to the DB so they exist for queries
            session.add(def_obj)
        session.commit()
        
        # CRITICAL: Clear cache again or detach objects so subsequent tests 
        # don't try to use these specific object instances bound to this closed session.
        # Ideally, ProfileFactory should handle re-attaching, but for tests we force a reload.
        ProfileFactory.clear_cache()
    
    # Return a new session for the test
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Creates a FastAPI TestClient that uses the in-memory DB session.
    Overrides the 'get_session' dependency in the app.
    """
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
