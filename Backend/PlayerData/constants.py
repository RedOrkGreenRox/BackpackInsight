"""
Constants for JSON keys and field names to avoid magic strings
"""

# Technical info keys
TECHNICAL_KEYS = {
    "DATA": "Data",
    "APP_VERSION": "AV",
    "BUILD_NUMBER": "BN", 
    "GIT_REVISION": "GR",
    "BUILD_TIMESTAMP": "BT",
    "USER_ID": "UID",
    "DEVICE_USER_ID": "DUID",
    "FIREBASE_ID": "FBID",
    "SAFE_AREA": "SafeArea",
    "SCREEN": "Screen",
    "DEVICE": "Device",
    "SUBSCRIPTION_MONTH_START": "SMS",
    "SEASON_SUBSCRIPTION_MONTH_START": "SSMS",
    "MEMORY": "Mem",
    "OS": "OS",
    "NTP1": "NTP1",
    "NTP2": "NTP2",
    "NTP_AVAILABLE": "NTPA",
    "DATE_TIME_UPDATED": "DTU",
    "DATE_TIME": "DT",
    "APPLICATION_SIGNATURE": "AS",
    "ELUID": "ELUID",
    "EPUID": "EPUID",
    "INSTALL_VERSION": "IV",
    "LATEST_VERSION": "LV",
    "VERSION_HISTORY": "VH",
    "INSTANCE_BUILD_ARRAY": "IBA",
    "AB": "AB",
    "CHECK_SUM": "CS",
    "RSM": "RSM",
}

# Game info keys
GAME_KEYS = {
    "NAME": "Name",
    "PURCHASE_HISTORY": "PH",
    "CURRENCY": "Currency",
    "UNLOCK_LIST": "UL",
    "TROPHY": "Trophy",
    "BONUS_TROPHY": "BonusTrophy",
    "HERO": "Hero",
    "ITEM": "Item",
}

# Default values
DEFAULT_VALUES = {
    "RARITY": "Common",
    "LEVEL": 1,
    "RATING": 0,
    "EXPERIENCE": 0,
    "COINS": 0,
    "GEMS": 0,
    "CARDS": 0,
}
