from typing import Dict, Any, List, Optional
import time
import re
import logging
from sqlmodel import Session, select
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.models.Hero import Hero
from Backend.PlayerData.models.Item import Item, ItemDefinition
from Backend.PlayerData.data import get_items, get_all_craftable_ids, PROFILE_EXP_NEED, PROFILE_AREAS
from Backend.PlayerData.constants import TECHNICAL_KEYS, GAME_KEYS, DEFAULT_VALUES

# Configure logging
logger = logging.getLogger(__name__)

class ProfileFactory:
    """
    Factory class responsible for parsing raw JSON data and creating
    Profile, Hero, and Item objects with proper relationships.
    """

    _definition_cache: Dict[str, ItemDefinition] = {}
    _fallback_count: int = 0
    _cache_hits: int = 0
    _cache_misses: int = 0
    _cache_timestamp: float = 0
    _cache_ttl: int = 300  # 5 минут

    @classmethod
    def get_cached_definitions(cls) -> Dict[str, ItemDefinition]:
        return cls._definition_cache

    @classmethod
    def get_cache_statistics(cls) -> Dict[str, Any]:
        """Возвращает статистику кэша для мониторинга"""
        total_requests = cls._cache_hits + cls._cache_misses
        hit_rate = (cls._cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "cache_size": len(cls._definition_cache),
            "cache_hits": cls._cache_hits,
            "cache_misses": cls._cache_misses,
            "hit_rate_percent": round(hit_rate, 2),
            "fallback_count": cls._fallback_count,
            "cache_timestamp": cls._cache_timestamp,
            "cache_ttl_seconds": cls._cache_ttl
        }

    @classmethod
    def clear_cache(cls):
        """Очищает кэш и сбрасывает статистику"""
        cls._definition_cache.clear()
        cls._fallback_count = 0
        cls._cache_hits = 0
        cls._cache_misses = 0
        cls._cache_timestamp = 0

    @classmethod
    def ensure_cache_fresh(cls, session: Optional[Session] = None):
        """Проверка и обновление кэша при необходимости"""
        current_time = time.time()
        if current_time - cls._cache_timestamp > cls._cache_ttl:
            if session:
                cls.refresh_from_database(session)
            else:
                cls.preload_definitions()
            cls._cache_timestamp = current_time
            logger.info(f"Cache refreshed at {current_time}")

    @classmethod
    def refresh_from_database(cls, session: Session):
        """Обновление кэша из БД без полной очистки"""
        db_items = {def_.item_id: def_ for def_ in session.exec(select(ItemDefinition)).all()}
        
        # Обновляем существующие и добавляем новые
        for item_id, definition in db_items.items():
            session.expunge(definition)
            cls._definition_cache[item_id] = definition
        
        logger.info(f"Refreshed cache with {len(db_items)} items from database")

    @classmethod
    def invalidate_cache(cls):
        """Полная очистка и перезагрузка кэша"""
        cls.clear_cache()
        cls.preload_definitions()
        logger.info("Cache invalidated and reloaded")

    @classmethod
    def preload_definitions(cls, session: Optional[Session] = None):
        """Загружает определения предметов из БД (приоритет) и JSON"""
        import time
        cls._cache_timestamp = time.time()
        
        # Сначала загружаем из БД (актуальные данные)
        if session:
            existing_defs = session.exec(select(ItemDefinition)).all()
            for definition in existing_defs:
                # НЕ используем expunge - оставляем объект привязанным к сессии
                cls._definition_cache[definition.item_id] = definition
        
        # Затем дополняем из JSON (только недостающие)
        items_dict = get_items()
        for item_id, static_data in items_dict.items():
            if item_id not in cls._definition_cache:
                cls._definition_cache[item_id] = cls._create_definition_from_static(static_data)

    @classmethod
    def create_profile(cls, json_data: Dict[str, Any]) -> Profile:
        cls._validate_json(json_data)

        if not cls._definition_cache:
            cls.preload_definitions()

        profile = Profile()

        # 1. Technical Info
        tech_data = cls._parse_technical_info(json_data)
        profile.technical_info_data = tech_data

        profile.app_version = tech_data.get(TECHNICAL_KEYS["APP_VERSION"])
        profile.device_model = tech_data.get(TECHNICAL_KEYS["DEVICE"])
        profile.os_version = tech_data.get(TECHNICAL_KEYS["OS"])
        profile.user_id = tech_data.get(TECHNICAL_KEYS["USER_ID"])

        # 2. Heroes
        if GAME_KEYS["HERO"] in json_data:
            for name, info in json_data[GAME_KEYS["HERO"]].items():
                hero = Hero.from_entry([name] + info.split(":"))
                profile.heroes.append(hero)

        # 3. Items
        if GAME_KEYS["ITEM"] in json_data:
            for name, info in json_data[GAME_KEYS["ITEM"]].items():
                item = cls._create_item(name, info)
                if item:
                    profile.items.append(item)

        # 4. Game Info & Derived Stats
        game_data = cls._parse_game_info_base(json_data)

        # --- ИСПРАВЛЕНИЕ: Добавлен парсинг скинов и баннеров из UL ---
        cls._parse_unlockables(json_data.get(GAME_KEYS["UNLOCK_LIST"], []), game_data)

        cls._calculate_stats(game_data, profile.items)

        profile.game_info_data = game_data

        # Analytics Fields
        profile.nickname = game_data.get(GAME_KEYS["NAME"])
        profile.trophies = game_data.get(GAME_KEYS["TROPHY"], 0) + game_data.get(GAME_KEYS["BONUS_TROPHY"], 0)
        profile.level = game_data.get("PlayerLevel", DEFAULT_VALUES["LEVEL"])
        profile.total_xp = game_data.get("PlayerExperienceTotal", DEFAULT_VALUES["EXPERIENCE"])
        profile.coins = game_data.get("Currency", {}).get("coins", 0)
        profile.gems = game_data.get("Currency", {}).get("gems", 0)

        return profile

    @staticmethod
    def _parse_skins(ul_list: List[str], game_data: Dict[str, Any]) -> None:
        """
        Парсит список UL для извлечения скинов.
        """
        skin_pattern = re.compile(r"^(.+)Skin(.+)$")
        
        for unlock in ul_list:
            if not isinstance(unlock, str) or "Skin" not in unlock:
                continue
                
            match = skin_pattern.match(unlock)
            if not match:
                continue
                
            character, skin = match.groups()
            if not (character.isalnum() and skin.isalnum()):
                continue
                
            if character not in game_data["Skins"]:
                game_data["Skins"][character] = []
            game_data["Skins"][character].append(skin)
    
    @staticmethod
    def _parse_banners(ul_list: List[str], game_data: Dict[str, Any]) -> None:
        """
        Парсит список UL для извлечения баннеров.
        """
        for unlock in ul_list:
            if not isinstance(unlock, str) or "Banner" not in unlock:
                continue
                
            parts = unlock.split("Banner")
            if len(parts) == 0:
                continue
                
            banner_name = parts[0]
            if not banner_name.isalnum():
                continue
                
            game_data["Banners"].append(banner_name)
    
    @staticmethod
    def _parse_unlockables(ul_list: List[str], game_data: Dict[str, Any]):
        """
        Аналог методов get_skins и get_banners из оригинального Profile.py.
        Парсит список UL для извлечения косметики.
        """
        ProfileFactory._parse_skins(ul_list, game_data)
        ProfileFactory._parse_banners(ul_list, game_data)

    @staticmethod
    def _parse_game_info_base(json_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            GAME_KEYS["NAME"]: json_data.get(GAME_KEYS["NAME"]),
            GAME_KEYS["PURCHASE_HISTORY"]: json_data.get(GAME_KEYS["PURCHASE_HISTORY"], "").split(",") if json_data.get(GAME_KEYS["PURCHASE_HISTORY"]) else [],
            GAME_KEYS["CURRENCY"]: json_data.get(GAME_KEYS["CURRENCY"], {}),
            GAME_KEYS["UNLOCK_LIST"]: json_data.get(GAME_KEYS["UNLOCK_LIST"], []),
            GAME_KEYS["TROPHY"]: json_data.get(GAME_KEYS["TROPHY"], 0),
            GAME_KEYS["BONUS_TROPHY"]: json_data.get(GAME_KEYS["BONUS_TROPHY"], 0),
            "ItemStats": {},
            "Skins": {},  # Будет заполнено в _parse_unlockables
            "Banners": [],  # Будет заполнено в _parse_unlockables
            "PlayerLevel": DEFAULT_VALUES["LEVEL"],
            "PlayerExperienceTotal": DEFAULT_VALUES["EXPERIENCE"],
            "PlayerExperienceCurrent": DEFAULT_VALUES["EXPERIENCE"],
            "PlayerExperienceNeed": 0,
            "Area": None
        }

    @classmethod
    def _validate_json(cls, json_data: Dict[str, Any]):
        if not isinstance(json_data, dict):
            raise ValueError("Invalid JSON format: Root must be an object.")
        if TECHNICAL_KEYS["DATA"] not in json_data:
            raise ValueError(f"Missing '{TECHNICAL_KEYS['DATA']}' section in JSON.")
        if not (GAME_KEYS["HERO"] in json_data or GAME_KEYS["ITEM"] in json_data):
            raise ValueError(f"JSON does not contain '{GAME_KEYS['HERO']}' or '{GAME_KEYS['ITEM']}' data.")
        uid = json_data.get(TECHNICAL_KEYS["DATA"], {}).get(TECHNICAL_KEYS["USER_ID"]) or json_data.get(TECHNICAL_KEYS["USER_ID"])
        if not uid:
            raise ValueError("Profile UID not found.")
        if not json_data.get(GAME_KEYS["NAME"]):
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
        try:
            level = int(parts[0]) + 1
            cards = int(parts[1])
        except ValueError:
            return None

        # Проверяем кэш и считаем статистику
        definition = cls._definition_cache.get(name)
        if definition:
            cls._cache_hits += 1
        else:
            cls._cache_misses += 1
            # Оптимизированный поиск по имени
            for d in cls._definition_cache.values():
                if d.name == name:
                    definition = d
                    cls._cache_hits += 1  # Корректируем статистику
                    break
        
        if not definition:
            # Пропускаем неизвестные предметы, чтобы избежать Foreign Key ошибки
            logger.warning(f"Unknown item '{name}' skipped - not found in definitions")
            cls._fallback_count += 1
            return None
        
        # Используем ID из определения, чтобы избежать DetachedInstanceError
        definition_id = definition.item_id if hasattr(definition, 'item_id') else definition.id
        return Item(level=level, cards=cards, definition_id=definition_id)

    @staticmethod
    def _parse_technical_info(json_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            TECHNICAL_KEYS["DATA"]: json_data.get(TECHNICAL_KEYS["DATA"], {}),
            TECHNICAL_KEYS["APP_VERSION"]: json_data.get(TECHNICAL_KEYS["DATA"], {}).get(TECHNICAL_KEYS["APP_VERSION"]),
            TECHNICAL_KEYS["BUILD_NUMBER"]: json_data.get(TECHNICAL_KEYS["BUILD_NUMBER"]),
            TECHNICAL_KEYS["GIT_REVISION"]: json_data.get(TECHNICAL_KEYS["GIT_REVISION"]),
            TECHNICAL_KEYS["BUILD_TIMESTAMP"]: json_data.get(TECHNICAL_KEYS["BUILD_TIMESTAMP"]),
            TECHNICAL_KEYS["USER_ID"]: json_data.get(TECHNICAL_KEYS["USER_ID"]),
            TECHNICAL_KEYS["DEVICE_USER_ID"]: json_data.get(TECHNICAL_KEYS["DEVICE_USER_ID"]),
            TECHNICAL_KEYS["FIREBASE_ID"]: json_data.get(TECHNICAL_KEYS["FIREBASE_ID"]),
            TECHNICAL_KEYS["SAFE_AREA"]: json_data.get(TECHNICAL_KEYS["SAFE_AREA"]),
            TECHNICAL_KEYS["SCREEN"]: json_data.get(TECHNICAL_KEYS["SCREEN"]),
            TECHNICAL_KEYS["DEVICE"]: json_data.get(TECHNICAL_KEYS["DEVICE"]),
            TECHNICAL_KEYS["SUBSCRIPTION_MONTH_START"]: json_data.get(TECHNICAL_KEYS["SUBSCRIPTION_MONTH_START"]),
            TECHNICAL_KEYS["SEASON_SUBSCRIPTION_MONTH_START"]: json_data.get(TECHNICAL_KEYS["SEASON_SUBSCRIPTION_MONTH_START"]),
            TECHNICAL_KEYS["MEMORY"]: json_data.get(TECHNICAL_KEYS["MEMORY"]),
            TECHNICAL_KEYS["OS"]: json_data.get(TECHNICAL_KEYS["OS"]),
            TECHNICAL_KEYS["NTP1"]: json_data.get(TECHNICAL_KEYS["NTP1"]),
            TECHNICAL_KEYS["NTP2"]: json_data.get(TECHNICAL_KEYS["NTP2"]),
            TECHNICAL_KEYS["NTP_AVAILABLE"]: json_data.get(TECHNICAL_KEYS["NTP_AVAILABLE"]),
            TECHNICAL_KEYS["DATE_TIME_UPDATED"]: json_data.get(TECHNICAL_KEYS["DATE_TIME_UPDATED"]),
            TECHNICAL_KEYS["DATE_TIME"]: json_data.get(TECHNICAL_KEYS["DATE_TIME"]),
            TECHNICAL_KEYS["APPLICATION_SIGNATURE"]: json_data.get(TECHNICAL_KEYS["APPLICATION_SIGNATURE"]),
            TECHNICAL_KEYS["ELUID"]: json_data.get(TECHNICAL_KEYS["ELUID"]),
            TECHNICAL_KEYS["EPUID"]: json_data.get(TECHNICAL_KEYS["EPUID"]),
            TECHNICAL_KEYS["INSTALL_VERSION"]: json_data.get(TECHNICAL_KEYS["INSTALL_VERSION"]),
            TECHNICAL_KEYS["LATEST_VERSION"]: json_data.get(TECHNICAL_KEYS["LATEST_VERSION"]),
            TECHNICAL_KEYS["VERSION_HISTORY"]: json_data.get(TECHNICAL_KEYS["VERSION_HISTORY"]),
            TECHNICAL_KEYS["INSTANCE_BUILD_ARRAY"]: json_data.get(TECHNICAL_KEYS["INSTANCE_BUILD_ARRAY"]),
            TECHNICAL_KEYS["AB"]: json_data.get(TECHNICAL_KEYS["AB"]),
            TECHNICAL_KEYS["CHECK_SUM"]: json_data.get(TECHNICAL_KEYS["CHECK_SUM"]),
            TECHNICAL_KEYS["RSM"]: json_data.get(TECHNICAL_KEYS["RSM"]),
        }

    @classmethod
    def _calculate_item_stats(cls, items: List[Item]) -> Dict[str, int]:
        """
        Calculate item statistics by rarity.
        """
        rarity_map = {}
        for item in items:
            if item.definition_id not in rarity_map:
                cached_def = cls._definition_cache.get(item.definition_id)
                rarity_map[item.definition_id] = cached_def.rarity if cached_def else "Common"
        
        item_stats = {}
        for item in items:
            rarity = rarity_map.get(item.definition_id, "Common")
            item_stats[rarity] = item_stats.get(rarity, 0) + 1
        
        return item_stats
    
    @classmethod
    def _calculate_level(cls, total_xp: int) -> tuple[int, int, int]:
        """
        Calculate player level and experience from total XP.
        Returns: (level, current_xp, xp_needed)
        """
        xp = total_xp
        lvl = 1
        
        for level_req in PROFILE_EXP_NEED:
            if xp >= level_req:
                lvl += 1
                xp -= level_req
            else:
                return lvl, xp, PROFILE_EXP_NEED[lvl - 1] if lvl - 1 < len(PROFILE_EXP_NEED) else 100_000
        
        # Handle levels beyond the defined array
        lvl += xp // 100_000
        xp %= 100_000
        return lvl, xp, 100_000
    
    @staticmethod
    def _calculate_area(trophy: int) -> str:
        """
        Calculate player area based on trophy count.
        """
        for i, area_req in enumerate(PROFILE_AREAS):
            if trophy < area_req:
                return f"{i:02d}"
        return "20"
    
    @classmethod
    def _calculate_stats(cls, game_data: Dict[str, Any], items: List[Item]):
        # Calculate item statistics
        item_stats = cls._calculate_item_stats(items)
        game_data["ItemStats"] = item_stats

        # Calculate total XP
        total_xp = sum(item.total_xp for item in items)
        game_data["PlayerExperienceTotal"] = total_xp

        # Calculate level and experience
        level, current_xp, xp_needed = cls._calculate_level(total_xp)
        game_data["PlayerExperienceCurrent"] = current_xp
        game_data["PlayerLevel"] = level
        game_data["PlayerExperienceNeed"] = xp_needed

        # Calculate area from trophies
        trophy = game_data["Trophy"] + game_data["BonusTrophy"]
        game_data["Area"] = cls._calculate_area(trophy)