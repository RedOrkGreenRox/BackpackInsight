from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.models.Hero import Hero
from Backend.PlayerData.models.Item import Item, ItemDefinition
from Backend.PlayerData.data import ITEMS, PROFILE_EXP_NEED, PROFILE_AREAS


class ProfileFactory:
    """
    Factory class responsible for parsing raw JSON data and creating
    Profile, Hero, and Item objects with proper relationships.
    """

    _definition_cache: Dict[str, ItemDefinition] = {}

    @classmethod
    def get_cached_definitions(cls) -> Dict[str, ItemDefinition]:
        return cls._definition_cache

    @classmethod
    def clear_cache(cls):
        cls._definition_cache.clear()

    @classmethod
    def preload_definitions(cls, session: Optional[Session] = None):
        for item_id, static_data in ITEMS.items():
            if item_id not in cls._definition_cache:
                cls._definition_cache[item_id] = cls._create_definition_from_static(static_data)

        if session:
            existing_defs = session.exec(select(ItemDefinition)).all()
            for definition in existing_defs:
                session.expunge(definition)
                cls._definition_cache[definition.item_id] = definition

    @classmethod
    def create_profile(cls, json_data: Dict[str, Any]) -> Profile:
        cls._validate_json(json_data)

        if not cls._definition_cache:
            cls.preload_definitions()

        profile = Profile()

        # 1. Technical Info
        tech_data = cls._parse_technical_info(json_data)
        profile.technical_info_data = tech_data

        profile.app_version = tech_data.get("AV")
        profile.device_model = tech_data.get("Device")
        profile.os_version = tech_data.get("OS")
        profile.user_id = tech_data.get("UID")

        # 2. Heroes
        if "Hero" in json_data:
            for name, info in json_data["Hero"].items():
                hero = Hero.from_entry([name] + info.split(":"))
                profile.heroes.append(hero)

        # 3. Items
        if "Item" in json_data:
            for name, info in json_data["Item"].items():
                item = cls._create_item(name, info)
                if item:
                    profile.items.append(item)

        # 4. Game Info & Derived Stats
        game_data = cls._parse_game_info_base(json_data)

        # --- ИСПРАВЛЕНИЕ: Добавлен парсинг скинов и баннеров из UL ---
        cls._parse_unlockables(json_data.get("UL", []), game_data)

        cls._calculate_stats(game_data, profile.items)

        profile.game_info_data = game_data

        # Analytics Fields
        profile.nickname = game_data.get("Nickname")
        profile.trophies = game_data.get("Trophy", 0) + game_data.get("BonusTrophy", 0)
        profile.level = game_data.get("PlayerLevel", 1)
        profile.total_xp = game_data.get("PlayerExperienceTotal", 0)
        profile.coins = game_data.get("Currency", {}).get("coins", 0)
        profile.gems = game_data.get("Currency", {}).get("gems", 0)

        return profile

    @staticmethod
    def _parse_unlockables(ul_list: List[str], game_data: Dict[str, Any]):
        """
        Аналог методов get_skins и get_banners из оригинального Profile.py.
        Парсит список UL для извлечения косметики.
        """
        for unlock in ul_list:
            # Парсинг скинов (формат: HeroNameSkinSkinName)
            if "Skin" in unlock:
                parts = unlock.split("Skin")
                if len(parts) == 2:
                    character, skin = parts
                    if character not in game_data["Skins"]:
                        game_data["Skins"][character] = []
                    game_data["Skins"][character].append(skin)

            # Парсинг баннеров (формат: BannerNameBanner)
            if "Banner" in unlock:
                banner_name = unlock.split("Banner")[0]
                game_data["Banners"].append(banner_name)

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
            "Skins": {},  # Будет заполнено в _parse_unlockables
            "Banners": [],  # Будет заполнено в _parse_unlockables
            "PlayerLevel": 1,
            "PlayerExperienceTotal": 0,
            "PlayerExperienceCurrent": 0,
            "PlayerExperienceNeed": 0,
            "Area": None
        }

    # Остальные методы (_validate_json, _create_item, _calculate_stats и т.д.)
    # остаются без изменений, как в вашем исходном файле.
    @classmethod
    def _validate_json(cls, json_data: Dict[str, Any]):
        if not isinstance(json_data, dict):
            raise ValueError("Invalid JSON format: Root must be an object.")
        if "Data" not in json_data:
            raise ValueError("Missing 'Data' section in JSON.")
        if not ("Hero" in json_data or "Item" in json_data):
            raise ValueError("JSON does not contain 'Hero' or 'Item' data.")
        uid = json_data.get("Data", {}).get("UID") or json_data.get("UID")
        if not uid:
            raise ValueError("Profile UID not found.")
        if not json_data.get("Name"):
            raise ValueError("Profile Nickname not found.")

    @classmethod
    def _create_definition_from_static(cls, static_data: Dict[str, Any]) -> ItemDefinition:
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
        parts = info.split(':')
        if len(parts) < 2: return None
        level = int(parts[0]) + 1
        cards = int(parts[1])
        definition = cls._definition_cache.get(name)
        if not definition:
            for d in cls._definition_cache.values():
                if d.name == name:
                    definition = d
                    break
        if not definition:
            definition = ItemDefinition(item_id=name, name=name, rarity="Common")
            cls._definition_cache[name] = definition
        return Item(level=level, cards=cards, definition_id=definition.item_id)

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
    def _calculate_stats(game_data: Dict[str, Any], items: List[Item]):
        for item in items:
            rarity = "Common"
            cached_def = ProfileFactory._definition_cache.get(item.definition_id)
            if cached_def:
                rarity = cached_def.rarity
            game_data["ItemStats"][rarity] = game_data["ItemStats"].get(rarity, 0) + 1

        total_xp = sum(item.total_xp for item in items)
        game_data["PlayerExperienceTotal"] = total_xp

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

        if game_data["PlayerLevel"] >= 100:
            game_data["PlayerExperienceNeed"] = 100_000
        else:
            idx = game_data["PlayerLevel"] - 1
            game_data["PlayerExperienceNeed"] = PROFILE_EXP_NEED[idx] if idx < len(PROFILE_EXP_NEED) else 100_000

        trophy = game_data["Trophy"] + game_data["BonusTrophy"]
        area = "20"
        for i, area_req in enumerate(PROFILE_AREAS):
            if trophy < area_req:
                area = f"{i:02d}"
                break
        game_data["Area"] = area