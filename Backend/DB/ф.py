import json
import os
from collections import defaultdict

# --- Configuration ---
ITEMS_FILE_PATH = "items.json"

# --- Data Structures ---
stats = {
    "total_items": 0,
    "total_coin_value": 0,
    "average_coin_value": 0,
    "items_by_type": defaultdict(list),
    "items_by_hero": defaultdict(list),
    "items_by_rarity": defaultdict(list),
    "items_by_tier": defaultdict(list), # Tier based on coin value ranges (example)
    "combat_stats_summary": {
        "damage_min": {"total": 0, "count": 0, "avg": 0},
        "damage_max": {"total": 0, "count": 0, "avg": 0},
        "cooldown": {"total": 0, "count": 0, "avg": 0},
        "stamina_cost": {"total": 0, "count": 0, "avg": 0},
        "accuracy": {"total": 0, "count": 0, "avg": 0},
        "critical_chance": {"total": 0, "count": 0, "avg": 0},
        "critical_damage": {"total": 0, "count": 0, "avg": 0}
    }
}

def process_item(item):
    """Analyzes a single item and updates global stats."""
    name = item.get("name", "Unknown")
    
    # 1. Basic Counts
    stats["total_items"] += 1
    
    # 2. Coin Value
    coin_value = item.get("coinValue")
    if coin_value is not None:
        stats["total_coin_value"] += coin_value
        
        # Example Tier Logic
        if coin_value < 5:
            stats["items_by_tier"]["Low (0-4)"].append(name)
        elif coin_value < 10:
            stats["items_by_tier"]["Mid (5-9)"].append(name)
        else:
            stats["items_by_tier"]["High (10+)"].append(name)

    # 3. Types
    for item_type in item.get("itemTypes", []):
        stats["items_by_type"][item_type].append(name)

    # 4. Hero Connection
    hero = item.get("connectedHero", "Shared")
    stats["items_by_hero"][hero].append(name)

    # 5. Rarity
    rarity = item.get("rarity", "Common")
    stats["items_by_rarity"][rarity].append(name)

    # 6. Combat Stats
    combat = item.get("combatStats", {})
    if combat:
        for key in stats["combat_stats_summary"]:
            # Convert key from snake_case to camelCase for JSON lookup
            json_key = "".join([w.title() if i > 0 else w for i, w in enumerate(key.split("_"))])
            
            val = combat.get(json_key)
            if val is not None:
                stats["combat_stats_summary"][key]["total"] += val
                stats["combat_stats_summary"][key]["count"] += 1

def calculate_averages():
    """Calculates averages after all items are processed."""
    if stats["total_items"] > 0:
        stats["average_coin_value"] = stats["total_coin_value"] / stats["total_items"]
    
    for key, data in stats["combat_stats_summary"].items():
        if data["count"] > 0:
            data["avg"] = data["total"] / data["count"]

def print_report():
    """Prints the analyzed data in a readable format."""
    print(f"--- ITEM ANALYSIS REPORT ---")
    print(f"Total Items: {stats['total_items']}")
    print(f"Total Coin Value: {stats['total_coin_value']}")
    print(f"Average Coin Value: {stats['average_coin_value']:.2f}")
    print("-" * 30)
    
    print("\n--- COMBAT STATS AVERAGES ---")
    for key, data in stats["combat_stats_summary"].items():
        print(f"{key.replace('_', ' ').title()}: {data['avg']:.2f} (based on {data['count']} items)")

    print("\n--- COUNTS BY RARITY ---")
    for rarity, items in stats["items_by_rarity"].items():
        print(f"{rarity}: {len(items)}")

    print("\n--- COUNTS BY HERO ---")
    for hero, items in stats["items_by_hero"].items():
        print(f"{hero}: {len(items)}")

    print("\n--- TOP 5 TYPES ---")
    sorted_types = sorted(stats["items_by_type"].items(), key=lambda x: len(x[1]), reverse=True)
    for t, items in sorted_types[:5]:
        print(f"{t}: {len(items)}")

def main():
    if not os.path.exists(ITEMS_FILE_PATH):
        print(f"Error: {ITEMS_FILE_PATH} not found.")
        return

    try:
        with open(ITEMS_FILE_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)
            
            if not isinstance(data, list):
                print("Error: JSON root must be a list of items.")
                return

            for item in data:
                process_item(item)
            
            calculate_averages()
            print_report()

    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from {ITEMS_FILE_PATH}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
