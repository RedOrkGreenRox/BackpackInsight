import pytest
from sqlmodel import select
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.models.Item import ItemDefinition, Item

def test_static_data_loaded(session):
    """Ensure static items (from items.json) are loaded into DB."""
    items = session.exec(select(ItemDefinition)).all()
    assert len(items) > 0, "Static items should be preloaded"
    
    # Check a known item
    sword = session.get(ItemDefinition, "Wooden Sword")
    assert sword is not None
    assert sword.rarity == "Common"

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
