import pytest
from sqlmodel import select
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.services.Search import search_items
from Backend.PlayerData.models.Item import ItemDefinition, Item

def test_static_data_loaded(session):
    """Ensure static items (from items.json) are loaded into DB."""
    items = session.exec(select(ItemDefinition)).all()
    assert len(items) > 0, "Static items should be preloaded"
    
    # Check a known item
    sword = session.get(ItemDefinition, "Wooden Sword")
    assert sword is not None
    assert sword.rarity == "Common"

def test_search_functionality(session):
    """Test the optimized search logic."""
    # 1. Exact Match
    results = search_items(session, "Wooden Sword", threshold=0.8)
    assert len(results) > 0
    assert results[0][0].name == "Wooden Sword"
    
    # 2. Partial Match (ILIKE check)
    results = search_items(session, "Sword", threshold=0.1)
    names = [r[0].name for r in results]
    assert "Wooden Sword" in names
    assert "Iron Sword" in names

def test_profile_creation(session):
    """Test creating a profile from minimal JSON."""
    mock_json = {
        "Name": "TestPlayer",
        "UID": "test-uid-123", # Added UID
        "Trophy": 1000,
        "Data": {"AV": "1.0"},
        "Item": {
            "Wooden Sword": "0:10" # Level 1, 10 cards
        },
        "Hero": {
            "Barbarian": "1:0:0"
        }
    }
    
    profile = Profile.from_json(mock_json)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    
    assert profile.nickname == "TestPlayer"
    assert len(profile.items) == 1
    assert profile.items[0].name == "Wooden Sword"
    assert profile.items[0].level == 1

def test_dynamic_search(session):
    """Test searching for items that belong to a player."""
    # Create a profile with a specific item
    mock_json = {
        "Name": "Finder",
        "UID": "test-uid-456", # Added UID
        "Data": {"AV": "1.0"}, # Added Data section
        "Item": {"Wooden Sword": "5:100"}
    }
    profile = Profile.from_json(mock_json)
    session.add(profile)
    session.commit()
    
    # Search specifically in dynamic scope
    results = search_items(session, "Wooden Sword", scope=["dynamic"])
    assert len(results) > 0
    item = results[0][0]
    assert isinstance(item, Item)
    assert item.level == 6 # 5 in JSON = Level 6
