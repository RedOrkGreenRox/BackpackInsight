from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from Profile import Profile
from Hero import Hero
from Item import Item, ItemDefinition
from data import ITEMS, PROFILE_EXP_NEED, PROFILE_AREAS

class ProfileFactory:
    """
    Factory class responsible for parsing raw JSON data and creating
    Profile, Hero, and Item objects with proper relationships.
    Includes caching for ItemDefinitions to optimize performance.
    """
    
    # Cache for ItemDefinitions to avoid recreating them for every item instance
    # Key: item_id, Value: ItemDefinition object
    _definition_cache: Dict[str, ItemDefinition] = {}

    @classmethod
    def preload_definitions(cls, session: Optional[Session] = None):
        """
        Preloads all ItemDefinitions from static data into the cache.
        If a session is provided, checks DB first to avoid duplicates.
        """
        # 1. Load from static JSON
        for item_id, static_data in ITEMS.items():
            if item_id not in cls._definition_cache:
                cls._definition_cache[item_id] = cls._create_definition_from_static(static_data)

        # 2. If DB session provided, sync with DB (optional, for advanced usage)
        if session:
            existing_defs = session.exec(select(ItemDefinition)).all()
            for definition in existing_defs:
                # CRITICAL FIX: Detach object from session so it can be cached globally
                # without causing DetachedInstanceError when session closes.
                session.expunge(definition)
                cls._definition_cache[definition.item_id] = definition

    @classmethod
    def create_profile(cls, json_data: Dict[str, Any]) -> Profile:
        # Ensure definitions are loaded (lazy load)
        if not cls._definition_cache:
            cls.preload_definitions()

        # 1. Create Profile Instance
        profile = Profile()
        
        # 2. Parse Technical Info
        tech_data = cls._parse_technical_info(json_data)
        profile.technical_info_data = tech_data
        
        # Populate Analytics Fields (Technical)
        profile.app_version = tech_data.get("AV")
        profile.device_model = tech_data.get("Device")
        profile.os_version = tech_data.get("OS")
        profile.user_id = tech_data.get("UID")

        # 3. Parse Heroes
        if "Hero" in json_data:
            for name, info in json_data["Hero"].items():
                hero = Hero.from_entry([name] + info.split(":"))
                profile.heroes.append(hero)
        
        # 4. Parse Items
        if "Item" in json_data:
            for name, info in json_data["Item"].items():
                item = cls._create_item(name, info)
                if item:
                    profile.items.append(item)

        # 5. Parse Game Info
        game_data = cls._parse_game_info_base(json_data)
        
        # 6. Calculate Derived Stats
        cls._calculate_stats(game_data, profile.items)
        
        profile.game_info_data = game_data
        
        # Populate Analytics Fields (Game)
        profile.nickname = game_data.get("Nickname")
        profile.trophies = game_data.get("Trophy", 0) + game_data.get("BonusTrophy", 0)
        profile.level = game_data.get("PlayerLevel", 1)
        profile.total_xp = game_data.get("PlayerExperienceTotal", 0)
        profile.coins = game_data.get("Currency", {}).get("coins", 0)
        profile.gems = game_data.get("Currency", {}).get("gems", 0)

        return profile

    @classmethod
    def _create_definition_from_static(cls, static_data: Dict[str, Any]) -> ItemDefinition:
        """Helper to create an ItemDefinition object from static JSON dict."""
        return ItemDefinition(
            item_id=static_data.get("id"),
            name=static_data.get("name", "Unknown"),
            rarity=static_data.get("rarity", "Common"),
            coin_value=static_data.get("coinValue"),
            item_types=static_data.get("itemTypes", []),
            connected_hero=static_data.get("connectedHero"),
            unlock_source=static_data.get("unlockSource"),
            item_shape=static_data.get("itemShape", []),
            item_stars=static_data.get("itemStars", []),
            purchasable=static_data.get("purchasable", False),
            recipes=static_data.get("recipes", []),
            combat_stats_data=static_data.get("combatStats", {}),
            all_stats_data=static_data.get("allStats", {}),
            tooltips=static_data.get("tooltips", []),
            levels_info=static_data.get("levels", {})
        )

    @classmethod
    def _create_item(cls, name: str, info: str) -> Optional[Item]:
        """Creates an Item instance using cached ItemDefinition."""
        parts = info.split(':')
        if len(parts) < 2: return None
        
        level = int(parts[0]) + 1
        cards = int(parts[1])
        
        # Find definition in cache
        # Note: 'name' in profile might match 'id' or 'name' in items.json. 
        # Assuming ITEMS dict keys are IDs or Names. In data.py ITEMS is keyed by ID.
        # We need to handle the case where profile uses Name but ITEMS uses ID.
        
        # Try to find by ID first (assuming name passed here is actually the ID/Name key)
        # In data.py: ITEMS = {item["id"]: item ...}
        
        # We need a way to lookup definition by Name if ID is different.
        # For now, we assume the key in profile["Item"] matches a key in ITEMS (which is ID).
        
        # Fallback: Search in cache by name if direct lookup fails
        definition = cls._definition_cache.get(name)
        
        if not definition:
            # Try to find by name in cache values
            for d in cls._definition_cache.values():
                if d.name == name:
                    definition = d
                    break
        
        if not definition:
            # If still not found, create a dummy definition to prevent crash
            # This happens if items.json is outdated compared to profile
            definition = ItemDefinition(item_id=name, name=name, rarity="Common")
            cls._definition_cache[name] = definition

        return Item(
            level=level,
            cards=cards,
            definition_id=definition.item_id,
            definition=definition # Link directly
        )

    @staticmethod
    def _parse_technical_info(json_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Data": json_data.get("Data", {}),
            "AV": json_data.get("Data", {}).get("AV"),
            "BN": json_data.get("BN"),
            "GR": json_data.get("GR"),
            "BT": json_data.get("BT"),
            "UID": json_data.get("UID"),
            "DUID": json_data.get("DUID"),
            "FBID": json_data.get("FBID"),
            "SafeArea": json_data.get("SafeArea"),
            "Screen": json_data.get("Screen"),
            "Device": json_data.get("Device"),
            "SMS": json_data.get("SMS"),
            "SSMS": json_data.get("SSMS"),
            "Mem": json_data.get("Mem"),
            "OS": json_data.get("OS"),
            "NTP1": json_data.get("NTP1"),
            "NTP2": json_data.get("NTP2"),
            "NTPA": json_data.get("NTPA"),
            "DTU": json_data.get("DTU"),
            "DT": json_data.get("DT"),
            "AS": json_data.get("AS"),
            "ELUID": json_data.get("ELUID"),
            "EPUID": json_data.get("EPUID"),
            "IV": json_data.get("IV"),
            "LV": json_data.get("LV"),
            "VH": json_data.get("VH"),
            "IBA": json_data.get("IBA"),
            "AB": json_data.get("AB"),
            "CS": json_data.get("CS"),
            "RSM": json_data.get("RSM"),
        }

    @staticmethod
    def _parse_game_info_base(json_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Nickname": json_data.get("Name"),
            "PH": json_data.get("PH", "").split(",") if json_data.get("PH") else [],
            "Currency": json_data.get("Currency", {}),
            "UL": json_data.get("UL", []),
            "Trophy": json_data.get("Trophy", 0),
            "BonusTrophy": json_data.get("BonusTrophy", 0),
            "ItemStats": {},
            "Skins": {},
            "Banners": [],
            "PlayerLevel": 1,
            "PlayerExperienceTotal": 0,
            "PlayerExperienceCurrent": 0,
            "PlayerExperienceNeed": 0,
            "Area": None
        }

    @staticmethod
    def _calculate_stats(game_data: Dict[str, Any], items: List[Item]):
        # Item Stats
        for item in items:
            if item.rarity:
                game_data["ItemStats"][item.rarity] = game_data["ItemStats"].get(item.rarity, 0) + 1

        # Skins
        for unlock in game_data["UL"]:
            if "Skin" in unlock:
                parts = unlock.split("Skin")
                if len(parts) > 1:
                    char, skin = parts[0], parts[1]
                    if char not in game_data["Skins"]:
                        game_data["Skins"][char] = []
                    game_data["Skins"][char].append(skin)

        # Banners
        for donation in game_data["UL"]:
            if "Banner" in donation:
                game_data["Banners"].append(donation.split("Banner")[0])

        # Experience
        total_xp = sum(item.total_xp for item in items)
        game_data["PlayerExperienceTotal"] = total_xp

        # Level
        xp = total_xp
        lvl = 1
        for level_req in PROFILE_EXP_NEED:
            if xp >= level_req:
                lvl += 1
                xp -= level_req
            else:
                game_data["PlayerExperienceCurrent"] = xp
                game_data["PlayerLevel"] = lvl
                break
        else:
            lvl += xp // 100000
            xp %= 100000
            game_data["PlayerExperienceCurrent"] = xp
            game_data["PlayerLevel"] = lvl

        # Experience Need
        if game_data["PlayerLevel"] >= 100:
            game_data["PlayerExperienceNeed"] = 100_000
        else:
            idx = game_data["PlayerLevel"] - 1
            if idx < len(PROFILE_EXP_NEED):
                game_data["PlayerExperienceNeed"] = PROFILE_EXP_NEED[idx]
            else:
                game_data["PlayerExperienceNeed"] = 100_000

        # Area
        trophy = game_data["Trophy"] + game_data["BonusTrophy"]
        area = "20"
        for i, area_req in enumerate(PROFILE_AREAS):
            if trophy < area_req:
                area = f"{i:02d}"
                break
        game_data["Area"] = area
