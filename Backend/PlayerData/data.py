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
    8000, 9000, 10000, 11000, 12000, 13000, 14000, 1500, 16000, 17000,
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
            match = re.search(r'items_(\d+)_(\d+)_(\d+)\.json', filename)
            if match:
                major, minor, patch = map(int, match.groups())
                return (major, minor, patch)
            return (0, 0, 0)
        
        # Находим файл с максимальной версией
        latest_file = max(files, key=extract_version)
        version = extract_version(latest_file)
        
        logger.info(f"Auto-detected latest items file: {Path(latest_file).name} (version {version[0]}.{version[1]}.{version[2]})")
        return Path(latest_file)
        
    except Exception as e:
        logger.exception("Error auto-detecting items file")
        # Fallback на старый путь
        return BASE_DIR.parent / "DB" / "items_3_1_0.json"

# Автоматически определяем путь к файлу с последней версией
ITEMS_PATH = get_latest_items_file()


def load_items():
    """Load items with proper error handling"""
    if ITEMS_PATH is None:
        logger.error("No items file available")
        return []
        
    try:
        with open(ITEMS_PATH, "rb") as f:
            data = json.loads(f.read())
            # JSON файл имеет структуру {"items": [...]}
            if isinstance(data, dict) and "items" in data:
                return data["items"]
            elif isinstance(data, list):
                return data
            else:
                logger.error(f"Invalid items file structure: expected dict with 'items' key or list, got {type(data)}")
                return []
    except FileNotFoundError:
        logger.error("Items file not found at %s", ITEMS_PATH)
        return []
    except json.JSONDecodeError as e:
        logger.exception("Invalid JSON in items file")
        return []
    except Exception as e:
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
