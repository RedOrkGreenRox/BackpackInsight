import json
import sys
import os
import pytest
import warnings
from pathlib import Path
from typing import List
from sqlmodel import SQLModel, create_engine, Session, select, func

# -- 0. Warning Configuration --
# Ignore library warnings (noise), but our custom prints will still show up
warnings.filterwarnings("ignore")

# -- 1. Environment Setup --
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))
project_root = current_dir.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

try:
    from Profile import Profile
    from ProfileFactory import ProfileFactory
    from Item import Item, ItemDefinition
    from Hero import Hero
    from data import ITEMS, BASE_DIR
    from Search import search_items 
except ImportError as e:
    print(f"CRITICAL ERROR: Could not import project modules. {e}")
    sys.exit(1)

# -- 2. Pytest Fixtures --

@pytest.fixture(scope="module")
def engine():
    return create_engine("sqlite:///:memory:")

@pytest.fixture(scope="module")
def db_session(engine):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(scope="module")
def profile_files():
    profiles_dir = BASE_DIR / "Profiles"
    files = list(profiles_dir.glob("*.json"))
    assert len(files) > 0, f"No profiles found in {profiles_dir}"
    return files

# -- 3. Tests --

def test_01_static_data_migration(db_session: Session):
    print("\n[Phase 1] Migrating Static Data...")
    ProfileFactory.preload_definitions()
    count = 0
    for def_obj in ProfileFactory._definition_cache.values():
        existing = db_session.get(ItemDefinition, def_obj.item_id)
        if not existing:
            db_session.add(def_obj)
            count += 1
    db_session.commit()
    print(f"Migrated {count} definitions.")
    db_count = db_session.exec(select(func.count(ItemDefinition.item_id))).one()
    assert db_count == count

def test_02_profile_ingestion(db_session: Session, profile_files: List[Path]):
    print("\n[Phase 2] Ingesting Profiles...")
    
    success_count = 0
    errors = []

    for p_file in profile_files:
        try:
            with open(p_file, "r", encoding="utf-8") as f:
                json_data = json.load(f)
            
            profile = Profile.from_json(json_data)
            
            # --- Logical Validation (Strict) ---
            warnings_found = []
            
            # 1. Check Heroes
            unknown_heroes = [h for h in profile.heroes if h.name == "Unknown"]
            if unknown_heroes:
                warnings_found.append(f"{len(unknown_heroes)} Unknown Heroes")
                
            # 2. Check Items
            unknown_items = [i for i in profile.items if i.name == i.definition_id and i.name not in ITEMS]
            if unknown_items:
                warnings_found.append(f"{len(unknown_items)} Missing Defs")
                
            # 3. XP Check (Strict: any diff > 0)
            if profile.items:
                calc_xp = sum(i.total_xp for i in profile.items)
                diff = calc_xp - profile.total_xp
                if diff != 0:
                    warnings_found.append(f"XP Diff: {diff:+d} (S:{profile.total_xp} vs C:{calc_xp})")
            
            # Print Status
            if warnings_found:
                # Use stderr to ensure visibility in some IDEs
                sys.stderr.write(f"  [WARN] {p_file.name}: {', '.join(warnings_found)}\n")
            else:
                print(f"  [OK]   {p_file.name}")
            # -------------------------------------

            db_session.add(profile)
            db_session.commit()
            db_session.refresh(profile)
            success_count += 1
        except Exception as e:
            db_session.rollback()
            errors.append(f"{p_file.name}: {str(e)}")
            sys.stderr.write(f"  [FAIL] {p_file.name}: {str(e)}\n")

    if errors:
        print("\nErrors encountered:")
        for err in errors:
            print(f" - {err}")

    assert success_count == len(profile_files)

def test_03_database_integrity(db_session: Session):
    print("\n[Phase 3] Verifying Integrity...")
    profiles = db_session.exec(select(Profile)).all()
    assert len(profiles) > 0
    for profile in profiles:
        if profile.heroes:
            assert profile.heroes[0].profile_id == profile.pk
        if profile.items:
            item = profile.items[0]
            assert item.profile_id == profile.pk
            assert item.definition is not None

def test_04_fuzzy_search(db_session: Session):
    print("\n[Phase 4] Testing Fuzzy Search...")
    
    # 1. Test Exact Match (Default Scope)
    first_def = db_session.exec(select(ItemDefinition)).first()
    target_name = first_def.name
    results = search_items(db_session, target_name, threshold=0.9)
    assert len(results) > 0
    
    # 2. Test Typo (Default Scope)
    if len(target_name) > 3:
        typo_name = target_name[:-1]
        results_typo = search_items(db_session, typo_name, threshold=0.4)
        found = any(r[0].name == target_name for r in results_typo)
        if found:
            print(f"  > Typo Search: '{typo_name}' found '{target_name}'")
    
    # 3. Test Dynamic Item Search (Default Scope)
    player_item = db_session.exec(select(Item)).first()
    if player_item:
        p_results = search_items(db_session, player_item.name, threshold=0.9)
        types_found = [r[2] for r in p_results]
        print(f"  > Search for '{player_item.name}' found types: {set(types_found)}")
        
        # 4. Test Scoped Search (NEW)
        # Search ONLY in static definitions
        static_results = search_items(db_session, player_item.name, scope=["static"], threshold=0.9)
        static_types = {r[2] for r in static_results}
        print(f"  > Scoped Search (Static) found: {static_types}")
        assert "Static Definition" in static_types
        assert not any("Player Item" in t for t in static_types), "Found dynamic item in static scope!"

        # Search ONLY in dynamic items
        dynamic_results = search_items(db_session, player_item.name, scope=["dynamic"], threshold=0.9)
        dynamic_types = {r[2] for r in dynamic_results}
        print(f"  > Scoped Search (Dynamic) found: {dynamic_types}")
        assert any("Player Item" in t for t in dynamic_types)
        assert "Static Definition" not in dynamic_types, "Found static definition in dynamic scope!"

if __name__ == "__main__":
    sys.exit(pytest.main(["-ra", "-s", __file__]))
