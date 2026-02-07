import json
from sqlmodel import select
from Backend.PlayerData.models.Profile import Profile

def test_read_main(client):
    """Test the main page loads."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_search_api(client):
    """Test the JSON search API."""
    response = client.get("/api/search?q=Sword")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]
    assert "rarity" in data[0]

def test_items_page(client):
    """Test the items catalog page."""
    response = client.get("/items")
    assert response.status_code == 200
    assert "Wooden Sword" in response.text

def test_404_handler(client):
    """Test custom 404 page."""
    response = client.get("/non_existent_page")
    assert response.status_code == 404
    assert "text/html" in response.headers["content-type"]

def test_profile_rotation_logic(client, session):
    """
    Test that we only keep the last 3 profiles for a specific user.
    Also tests edge case where the 4th upload is a duplicate of the 3rd.
    """
    uid = "test-rotation-uid"
    
    # Helper to create a profile payload
    def create_payload(index):
        return {
            "Name": "Rotator",
            "UID": uid,
            "Data": {"AV": "1.0"},
            "Hero": {"Barbarian": "1:0:0"}, # Added Hero to pass validation
            # Change something in game info to ensure they are treated as unique updates
            "Trophy": 1000 + index 
        }

    # 1. Upload 3 unique profiles
    for i in range(1, 4):
        payload = create_payload(i)
        response = client.post("/profile", data={"json_text": json.dumps(payload)})
        assert response.status_code == 200, f"Upload {i} failed"
        
    # Check state: Should have 1, 2, 3
    profiles = session.exec(select(Profile).where(Profile.user_id == uid).order_by(Profile.pk)).all()
    assert len(profiles) == 3, f"Expected 3 profiles, found {len(profiles)}"
    assert profiles[0].trophies == 1001
    assert profiles[2].trophies == 1003

    # 2. Upload 4th profile which is a DUPLICATE of the 3rd
    # This should NOT trigger rotation, because no new profile is added.
    payload_duplicate = create_payload(3) # Same as 3rd
    client.post("/profile", data={"json_text": json.dumps(payload_duplicate)})
    
    profiles_after_dup = session.exec(select(Profile).where(Profile.user_id == uid).order_by(Profile.pk)).all()
    
    # Assertions for Duplicate Edge Case:
    # - Count should still be 3 (not 2, not 4)
    # - The oldest profile (1001) should STILL exist (rotation didn't happen)
    assert len(profiles_after_dup) == 3, "Duplicate upload should not change profile count"
    assert profiles_after_dup[0].trophies == 1001, "Oldest profile should remain if upload was a duplicate"
    assert profiles_after_dup[2].trophies == 1003

    # 3. Upload 5th profile (Unique)
    # Now rotation SHOULD happen. 1001 should go away. 1002, 1003, 1005 should remain.
    payload_new = create_payload(5)
    client.post("/profile", data={"json_text": json.dumps(payload_new)})
    
    profiles_final = session.exec(select(Profile).where(Profile.user_id == uid).order_by(Profile.pk)).all()
    
    assert len(profiles_final) == 3
    trophies = [p.trophies for p in profiles_final]
    assert 1001 not in trophies, "Oldest profile should be rotated out now"
    assert 1002 in trophies
    assert 1003 in trophies
    assert 1005 in trophies

def test_duplicate_profile_logic(client, session):
    """
    Test that uploading the EXACT same profile data does not create a new DB entry.
    """
    uid = "test-duplicate-uid"
    payload = {
        "Name": "Duplicator",
        "UID": uid,
        "Data": {"AV": "1.0"},
        "Hero": {"Barbarian": "1:0:0"}, # Added Hero to pass validation
        "Trophy": 500
    }
    
    # 1. First Upload
    response = client.post("/profile", data={"json_text": json.dumps(payload)})
    assert response.status_code == 200
    
    profiles_before = session.exec(select(Profile).where(Profile.user_id == uid)).all()
    assert len(profiles_before) == 1, f"Expected 1 profile, found {len(profiles_before)}"
    pk_1 = profiles_before[0].pk
    
    # 2. Second Upload (Same Data)
    response = client.post("/profile", data={"json_text": json.dumps(payload)})
    assert response.status_code == 200
    
    profiles_after = session.exec(select(Profile).where(Profile.user_id == uid)).all()
    assert len(profiles_after) == 1
    pk_2 = profiles_after[0].pk
    
    # PK should be identical (no new row created)
    assert pk_1 == pk_2
