import json
from pathlib import Path
import logging
import glob
import re

# Configure logging
logger = logging.getLogger(__name__)

PROFILE_EXP_NEED = (
    40, 280, 300, 400, 500, 650, 650, 800, 950, 1000,
    1050, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900,
    2000, 2150, 2300, 2700, 3000, 4000, 4600, 5400, 6000, 7000,
    8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000,
    18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 25000, 25000,
    25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000,
    25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000,
    25000, 25000, 25000, 25000, 25000, 30000, 35000, 40000, 45000, 50000,
    55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000,
    100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000
)

BASE_DIR = Path(__file__).parent

def get_latest_items_file():
    """Автоматически находит файл с наибольшим номером версии"""
    try:
        # Ищем все файлы items_*.json в папке DB
        pattern = str(BASE_DIR.parent / "DB" / "items_*.json")
        files = glob.glob(pattern)
        
        # Исключаем файлы с tooltips
        files = [f for f in files if 'tooltips' not in f]
        
        if not files:
            logger.error("No items JSON files found")
            return None
        
        def extract_version(filename):
            """Извлекает версию из имени файла"""
            match = re.search(r'items_(?:en_|ru_)?(\d+)_(\d+)_(\d+)\.json', filename)
            if match:
                major, minor, patch = map(int, match.groups())
                return (major, minor, patch)
            return (0, 0, 0)
        
        # Находим файл с максимальной версией
        latest_file = max(files, key=extract_version)
        version = extract_version(latest_file)
        
        logger.info(f"Auto-detected latest items file: {Path(latest_file).name} (version {version[0]}.{version[1]}.{version[2]})")
        return Path(latest_file)
        
    except Exception:
        logger.exception("Error auto-detecting items file")
        # Fallback на старый путь
        return BASE_DIR.parent / "DB" / "items_3_1_0.json"

# Автоматически определяем путь к файлу с последней версией
ITEMS_PATH = get_latest_items_file()


def load_items():
    """Load items and merge English and Russian locales for 5.1.0 when available"""
    db_dir = BASE_DIR.parent / "DB"
    en_path = db_dir / "items_en_5_1_0.json"
    ru_path = db_dir / "items_ru_5_1_0.json"

    # Если оба файла 5.1.0 существуют, сливаем их
    if en_path.exists() and ru_path.exists():
        try:
            logger.info("Merging items_en_5_1_0.json and items_ru_5_1_0.json")
            with open(en_path, "r", encoding="utf-8") as f:
                en_data = json.load(f)
                en_list = en_data.get("items", en_data) if isinstance(en_data, dict) else en_data
            with open(ru_path, "r", encoding="utf-8") as f:
                ru_data = json.load(f)
                ru_list = ru_data.get("items", ru_data) if isinstance(ru_data, dict) else ru_data

            merged_items = {}
            for item in en_list:
                item_id = item["id"]
                merged_items[item_id] = {
                    **item,
                    "names_local": {"en": item["name"], "ru": item["name"]},
                    "tooltips_local": {"en": item.get("tooltips", []), "ru": item.get("tooltips", [])}
                }
            for item in ru_list:
                item_id = item["id"]
                if item_id in merged_items:
                    merged_items[item_id]["names_local"]["ru"] = item["name"]
                    merged_items[item_id]["tooltips_local"]["ru"] = item.get("tooltips", [])
                else:
                    merged_items[item_id] = {
                        **item,
                        "names_local": {"en": item["name"], "ru": item["name"]},
                        "tooltips_local": {"en": item.get("tooltips", []), "ru": item.get("tooltips", [])}
                    }
            return list(merged_items.values())
        except Exception:
            logger.exception("Error merging localized 5.1.0 files, falling back to sequential loader")

    if ITEMS_PATH is None:
        logger.error("No items file available")
        return []
        
    try:
        with open(ITEMS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            raw_list = data.get("items", data) if isinstance(data, dict) else data
            
            result_list = []
            for item in raw_list:
                result_list.append({
                    **item,
                    "names_local": {"en": item["name"], "ru": item["name"]},
                    "tooltips_local": {"en": item.get("tooltips", []), "ru": item.get("tooltips", [])}
                })
            return result_list
    except FileNotFoundError:
        logger.error("Items file not found at %s", ITEMS_PATH)
        return []
    except json.JSONDecodeError:
        logger.exception("Invalid JSON in items file")
        return []
    except Exception:
        logger.exception("Error loading items")
        return []


# Lazy loading to avoid blocking import
_items_list = None

def get_items():
    global _items_list
    if _items_list is None:
        _items_list = {item["id"]: item for item in load_items()}
        logger.info(f"Loaded {len(_items_list)} items")
    return _items_list

def get_all_craftable_ids():
    """Get all craftable item IDs"""
    items_list = load_items()
    return {
        recipe['resultId']
        for item in items_list
        for recipe in item.get("recipes", [])
    }

VALUES = {
    "AV": "Actual Version", "BN": "Build Number", "GR": "Git Revision",
    "BT": "Build Timestamp", "Name": "Nickname", "PH": "Purchase History",
    "UL": "Unlock List", "Barbarian": "Harkon", "Elementalist": "Chana",
    "Warrior": "Ronan", "Marksman": "Nymphedora", "Engineer": "Tink",
    "Beekeeper": "Buzz", "Hob": "Hob", "UID": "User ID", "DUID": "Device User ID",
    "FBT": "Firebase Token", "FBID": "Firebase ID", "SMS": "Subscription Month Start",
    "SSMS": "Season Subscription Month Start ", "Mem": "Memory",
    "TRM": "Total RAM Memory", "TAM": "Total Available Memory",
    "TURM": "Total Usable RAM Memory", "UM": "Used Memory", "OS": "Operating System",
    "NTP1": "Network Time Protocol 1", "NTP2": "Network Time Protocol 2",
    "NTPA": "Network Time Protocol Available", "DTU": "Date Time Updated",
    "DT": "Date TIme", "AS": "Application Signature", "ELUID": "ELUID",
    "UPUID": "UPUID", "IV": "Install Version", "LV": "Latest Version",
    "VH": "Version History", "IBA": "Instance Build Array", "AB": "AB",
    "CS": "Check Sum", "RSM": "RSM",
}

ITEM_LEVELING_CARDS = {
    "Common": (0, 5, 10, 25, 50, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1200),
    "Rare": (0, 5, 10, 15, 25, 50, 80, 120, 160, 200, 240, 300, 400, 500, 600),
    "Epic": (0, 4, 6, 10, 15, 25, 40, 60, 80, 100, 120, 150, 180, 240, 300),
    "Legendary": (0, 4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100),
    "Mythic": (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 25, 30, 35, 40),
    "Unique": (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 25, 30, 35, 40),
    "Relic": (0, 40, 60, 100, 300, 500, 800, 1200, 1600, 2000)
}

ITEM_LEVELING_EXP = {
    "Common": (0, 5, 10, 25, 50, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1200),
    "Rare": (0, 10, 20, 30, 50, 100, 160, 240, 320, 400, 480, 600, 800, 1000, 1200),
    "Epic": (0, 20, 30, 50, 75, 125, 200, 300, 400, 500, 600, 750, 900, 1200, 1500),
    "Legendary": (0, 60, 90, 120, 150, 180, 225, 300, 375, 450, 600, 750, 900, 1200, 1500),
    "Mythic": (0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 1000, 1200, 1400, 1600),
    "Unique": (0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 1000, 1200, 1400, 1600),
    "Relic": (0, 100, 200, 300, 400, 500, 600, 700, 800, 1000)
}

HERO_LEVELING_EXP = {
    1: 0, 2: 100, 3: 200, 4: 350, 5: 500, 6: 650, 7: 800, 8: 1000,
    9: 1200, 10: 1400, 11: 1650, 12: 1900, 13: 2200, 14: 2500,
    15: 2850, 16: 3200, 17: 3600, 18: 4050, 19: 4500, 20: 5000
}

HERO_LEAGUES = (
    "Bronze", "Silver", "Gold", "Emerald", "Ruby", "Sapphire",
    "Diamond", "Heroic", "Epic", "Legendary", "Mythic"
)

PROFILE_AREAS = (
    0, 5, 50, 100, 200, 300, 400, 500, 700, 1000,
    1600, 2300, 3500, 4800, 6500, 8500, 12000, 16000, 22000, 30000
)
