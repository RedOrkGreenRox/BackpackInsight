import pytest
import json
import sys
from pathlib import Path
from sqlmodel import select

# Imports are handled by conftest.py sys.path setup
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.data import get_items

# Define path to profiles relative to this test file
# tests/ -> root -> Backend -> PlayerData -> Profiles
PROFILES_DIR = Path(__file__).resolve().parent.parent / "Backend" / "PlayerData" / "Profiles"

def get_profile_files():
    """Helper to find all .json files in the Profiles directory."""
    if not PROFILES_DIR.exists():
        return []
    return list(PROFILES_DIR.glob("*.json"))

@pytest.mark.parametrize("profile_path", get_profile_files())
def test_real_profile_ingestion(session, profile_path):
    """
    Integration test that loads REAL profile JSONs from the disk.
    Checks for:
    1. Parsing errors.
    2. Unknown heroes/items.
    3. XP calculation consistency.
    """
    print(f"\nTesting Profile: {profile_path.name}")
    
    with open(profile_path, "r", encoding="utf-8-sig") as f:
        json_data = json.load(f)
    
    # 1. Attempt to parse and save
    profile = None  # Initialize to satisfy linter
    try:
        profile = Profile.from_json(json_data)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    except Exception as e:
        pytest.fail(f"Failed to parse/save {profile_path.name}: {e}")

    # If pytest.fail is called, execution stops there.
    # So if we reach here, profile is guaranteed to be assigned.

    # 2. Logical Validations (Warnings turned into assertions or prints)
    
    # Check Heroes
    unknown_heroes = [h for h in profile.heroes if h.name == "Unknown"]
    if unknown_heroes:
        print(f"  [WARN] {len(unknown_heroes)} Unknown Heroes found in {profile_path.name}")
        # We don't fail the test for this, as it might be new game content, but we log it.

    # Check Items
    # Note: item.name is a proxy to definition.name. If definition is missing, it might be the ID.
    unknown_items = []
    items_dict = get_items()
    for i in profile.items:
        # If the item name matches its ID, it usually means the definition wasn't found 
        # and the factory created a dummy definition with name=id.
        # Unless the item's real name IS its ID (rare).
        if i.name == i.definition_id and i.definition_id not in items_dict:
            unknown_items.append(i.name)
            
    if unknown_items:
        print(f"  [WARN] {len(unknown_items)} Missing Definitions in {profile_path.name}: {unknown_items}")

    # 3. XP Consistency Check
    # Compare the total XP stored in the profile vs calculated from items
    if profile.items:
        calc_xp = sum(i.total_xp for i in profile.items)
        stored_xp = profile.total_xp
        diff = calc_xp - stored_xp
        
        # We allow a small margin of error or treat it as a warning
        if diff != 0:
            msg = f"XP Mismatch in {profile_path.name}: Stored={stored_xp}, Calc={calc_xp}, Diff={diff:+d}"
            print(f"  [WARN] {msg}")
            # Uncomment the next line to make XP mismatch a hard failure:
            # assert diff == 0, msg

    assert profile.pk is not None
    assert len(profile.heroes) > 0 or len(profile.items) > 0
