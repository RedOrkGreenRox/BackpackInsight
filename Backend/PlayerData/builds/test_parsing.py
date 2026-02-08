import re
import json
import csv
import ast

# --- CONSTANTS & CONFIGURATION ---

KNOWN_TYPES = [
    "MeleeWeapon", "RangedWeapon", "Pet", "Food", "Plant", "Mineral", 
    "Armor", "Shield", "Helmet", "Boots", "Gloves", "Accessory", 
    "Gem", "Potion", "Mana", "Gold", "Toy", "Holy", "Dark", "Magic"
]

POSITIVE_ACTIONS = ["Gain", "Heal", "Cleanse", "Get", "Activate", "Block", "Trigger", "Recover", "Restore", "Add", "Open", "Do"]
NEGATIVE_ACTIONS = ["Inflict", "Steal", "Remove", "Deal", "Stun", "Drain", "Weaken", "Sabotage", "Break", "Trap", "Shoot", "Ignores"]

ITEM_STATS = [
    "Static", "minDamage", "maxDamage", "Damage", "CritChance", 
    "CritDamage", "Accuracy", "faster attacks", "faster activations"
]

# Stats that look like combined types but shouldn't be split
STAT_EXCEPTIONS = [
    "CritChance", "CritDamage", "MaxHealth", "StaminaRecovery"
]

# --- REGEX PATTERNS ---

# 1. General Patterns
RE_COMBINED_TYPES = re.compile(r"\b(?:Star )?([A-Z][a-z]+){2,}\b")
RE_PARENS = re.compile(r"\((?P<content>.*?)\)")

# 2. Trigger Parsing
# Added: If, During, Out of stamina
RE_TRIGGER = re.compile(
    r"^(?P<trigger>(?:On|When|Start of|Every|Health below|Opponent health below|After|While|Per|Shops entered|Discharge|Items crafted|Fights|If|During|Out of stamina|Presents opened).*?):?$", 
    re.IGNORECASE
)

# 3. Effect Parsing
RE_COST = re.compile(
    r"(?P<cost>(?:Use|Spend) \d+(?:\.\d+)? (?:Mana|Stamina|Gold|Health|TypePotion use)(?: to)?)", 
    re.IGNORECASE
)

# Improved Scaling: matches "per Star item", "per 10 Mana gained", "per second for 5 seconds"
RE_SCALING = re.compile(
    r"(?P<scaling>per (?:second for \d+ seconds|\d+ [\w\s]+|Star [\w\s]+|[\w\s]+))", 
    re.IGNORECASE
)

# Generalized Transform to catch "Polishes into", "Turn X into Y"
RE_TRANSFORM = re.compile(
    r"(?:Turn|Polishes|Transforms?) (?P<source>.+?)? ?into (?P<target>.+)", 
    re.IGNORECASE
)

# 4. Detail Parsing
# Expanded verbs list
RE_VERBS = re.compile(
    r"^(?P<verb>Gain|Inflict|Steal|Remove|Cleanse|Heal|Deal|Stun|Use|Spend|Trigger|Activate|Reduce|Increase|Drain|Block|Weaken|Sabotage|Brings|Catch|Find|Get|Break|Become|Transform|Recover|Restore|Shoot|Trap|Dig|Hammer|Check|Attract|Add|Look|Have|Polishes|Absorb|Destroy|Open|Ignores|Do)", 
    re.IGNORECASE
)

# Improved Values: Handles negatives, floats, and excludes common non-stat words
# Updated to allow "faster" as a starting word for stats like "faster attacks"
# Updated to allow "different", "random", "more" before the stat name (and ignore them in capture)
RE_VALUES = re.compile(r"(?P<amount>[+-]?\d+(?:\.\d+)?)(?:%|x)?\s+(?:different\s+|random\s+|more\s+)?(?P<stat>(?:max )?(?:[A-Z][a-zA-Z]*|faster)(?: [a-zA-Z]+)*)")

RE_REDUCE_BY = re.compile(r"(?:Reduce|Increase) (?P<stat>[\w\s]+) by (?P<amount>\d+(?:\.\d+)?)", re.IGNORECASE)
RE_DURATION = re.compile(r"for (?P<dur>\d+(?:\.\d+)?) seconds")
RE_MINIMUM = re.compile(r"\(minimum (?P<min>\d+(?:\.\d+)?)\)", re.IGNORECASE)
RE_PROGRESS = re.compile(r"\((?P<current>\d+)/(?P<max>\d+)\)")

RE_TARGET_PREP = re.compile(r"on (?P<target>opponent|yourself|both players|enemy \w+|your hero|another hero)", re.IGNORECASE)

# Improved Subject: Captures "Star items", "Your Pet", "This", "MeleeWeaponRangedWeapon"
RE_SUBJECT = re.compile(r"^(?P<subject>(?:Star |Your |This |All |equipped )?(?:[a-zA-Z]+)(?: [a-zA-Z]+)*?) (?:gains|gain|get|trigger|goes|are|benefits|have|has)", re.IGNORECASE)

RE_OBJ_TARGET = re.compile(r"(?:Stun|Weaken|Sabotage|Break) (?P<obj>[\w\s]+?)(?: for|$)", re.IGNORECASE)

# Updated RE_CHANCE to capture float and match "chance" or "to"
RE_CHANCE = re.compile(r"(?P<chance>\d+(?:\.\d+)?)%\s*(?:chance|to\b)", re.IGNORECASE)
RE_CHANCE_START = re.compile(r"^(?P<chance>\d+(?:\.\d+)?)%\s*(?:chance\s+(?:to\b)?|to\b)\s*", re.IGNORECASE)
RE_CHANCE_WORD = re.compile(r"\bchance\b", re.IGNORECASE)

# 5. Trigger Values Parsing
RE_TRIG_HIT = re.compile(r"hit (\d+) times", re.IGNORECASE)
RE_TRIG_SEC = re.compile(r"Every (\d+(?:\.\d+)?) seconds", re.IGNORECASE)
RE_TRIG_HP = re.compile(r"Health below (\d+)%", re.IGNORECASE)
RE_TRIG_STATIC = re.compile(r"Discharge \((\d+)Static\)", re.IGNORECASE)
RE_TRIG_SHOP = re.compile(r"Every (\d+) shops entered", re.IGNORECASE)

# 6. Special Lines
RE_COUNTER = re.compile(r"^(?P<name>[\w\s]+): (?P<current>\d+)/(?P<max>\d+)$")
RE_DEFINITION = re.compile(r"^(?P<name>[\w\s]+):$") # Matches "Weaken:", "Call of the Void:"

# --- FUNCTIONS ---

def split_combined_types(text):
    """
    Splits CamelCase combined types like 'MeleeWeaponRangedWeaponPet' 
    into a list of tags: ['MeleeWeapon', 'RangedWeapon', 'Pet'].
    """
    if " " in text.strip():
        return None
        
    # Check exceptions first
    if text in STAT_EXCEPTIONS:
        return None

    parts = re.findall(r'[A-Z][a-z]+', text)
    
    tags = []
    i = 0
    while i < len(parts):
        if i + 1 < len(parts):
            combined = parts[i] + parts[i+1]
            if combined in KNOWN_TYPES or combined.startswith("Type"):
                tags.append(combined)
                i += 2
                continue
        
        tags.append(parts[i])
        i += 1
        
    if len(tags) > 1:
        return tags
    return None

def normalize_text(text):
    """
    Pre-processes text to handle complex types and standardize format.
    Example: "Star MeleeWeaponRangedWeaponPet" -> "Star MeleeWeapon, RangedWeapon, Pet"
    """
    # Find combined types
    matches = list(RE_COMBINED_TYPES.finditer(text))
    
    # Process in reverse to avoid index shifting
    for match in reversed(matches):
        full_match = match.group(0)
        # Extract the type part (remove "Star " if present)
        type_part = full_match.replace("Star ", "")
        prefix = "Star " if "Star " in full_match else ""
        
        # Skip if it's a known stat exception
        if type_part in STAT_EXCEPTIONS:
            continue
        
        split_tags = split_combined_types(type_part)
        if split_tags:
            # Reconstruct as comma separated list
            normalized = prefix + ", ".join(split_tags)
            text = text[:match.start()] + normalized + text[match.end():]
            
    return text

def parse_effect_details(text):
    """
    Deeply parses an effect string to extract:
    1. Action (Verb)
    2. Values (Dictionary of Entity: Amount)
    3. Targets (List)
    4. Flags (Dictionary of Flags)
    """
    details = {
        "action": None,
        "values": {},
        "targets": [],
        "flags": {}
    }

    # --- 0. Pre-check for Chance at start ---
    # If the line starts with "50% chance to...", we strip it first so RE_VERBS can match "Trigger"
    chance_start_match = RE_CHANCE_START.match(text)
    if chance_start_match:
        details["flags"]["Chance"] = float(chance_start_match.group("chance")) / 100.0
        text = text[chance_start_match.end():]

    # --- 1. Action Extraction ---
    match_verb = RE_VERBS.search(text)
    if match_verb:
        verb = match_verb.group("verb").capitalize()
        # Normalize synonyms
        if verb in ["Brings", "Catch", "Find", "Attract"]:
            details["action"] = "Get"
        elif verb == "Become":
            details["action"] = "Apply Status"
        elif verb == "Polishes":
            details["action"] = "Transform"
        else:
            details["action"] = verb
    else:
        # Implicit actions
        if "gains" in text or "gain" in text:
            details["action"] = "Gain"
        elif "get" in text.lower():
            details["action"] = "Get"
        elif "transform" in text.lower():
            details["action"] = "Transform"

    # --- 2. Values Extraction (Entity: Amount) ---
    found_stats = []
    
    for match in RE_VALUES.finditer(text):
        amount = float(match.group("amount"))
        if amount.is_integer():
            amount = int(amount)
        
        stat = match.group("stat").strip()
        stat = re.sub(r"\s+(and|or)$", "", stat, flags=re.IGNORECASE).strip(" ,")
        stat = re.sub(r"\s+(on|per|from|to|for)\s+.*$", "", stat, flags=re.IGNORECASE).strip()

        if stat.lower() in ["seconds", "chance", "use", "uses", "random"]:
            continue
            
        details["values"][stat] = amount
        found_stats.append(stat.lower())

    match_red = RE_REDUCE_BY.search(text)
    if match_red:
        stat = match_red.group("stat").strip()
        amount = float(match_red.group("amount"))
        if amount.is_integer(): amount = int(amount)
        details["values"][stat] = amount
        found_stats.append(stat.lower())

    dur_match = RE_DURATION.search(text)
    if dur_match:
        duration = float(dur_match.group("dur"))
        if duration.is_integer(): duration = int(duration)
        
        if details["action"] in ["Stun", "Blind", "Burn", "Poison", "Chill", "Bleed"]:
            if details["action"] not in details["values"]:
                details["values"][details["action"]] = duration
        else:
            details["values"]["Duration"] = duration

    min_match = RE_MINIMUM.search(text)
    if min_match:
        min_val = float(min_match.group("min"))
        if min_val.is_integer(): min_val = int(min_val)
        details["values"]["Minimum"] = min_val
        
    prog_match = RE_PROGRESS.search(text)
    if prog_match:
        details["values"]["Progress_Current"] = int(prog_match.group("current"))
        details["values"]["Progress_Max"] = int(prog_match.group("max"))

    # --- 2.1 Action Object Extraction ---
    # Expanded list of actions that take an object
    if details["action"] in ["Trigger", "Activate", "Get", "Break", "Shoot", "Trap", "Restore", "Dig", "Hammer", "Check", "Absorb", "Destroy", "Have", "Open", "Cleanse", "Do"]:
        obj_text = re.sub(r"^(Trigger|Activate|Get|Brings|Catch|Find|Break|Shoot|Trap|Restore|Dig|Hammer|Check|Attract|Absorb|Destroy|Have|Open|Cleanse|Do)\s+(you\s+)?(an|a|the|random|for)?\s*", "", text, flags=re.IGNORECASE).strip()
        obj_text = re.sub(r"^\d+% chance (to )?(get|catch|find|trigger|activate|shoot|trap|dig|hammer|check|absorb|destroy|open|cleanse|do)\s+(an|a|the)?\s*", "", obj_text, flags=re.IGNORECASE).strip()
        obj_text = re.split(r"\s+(per|on|if|to)\s+", obj_text)[0]
        obj_text = re.sub(r"\(.*?\)", "", obj_text).strip()
        
        if "random" in text.lower():
            details["flags"]["Random"] = True
            obj_text = re.sub(r"\brandom\b", "", obj_text, flags=re.IGNORECASE).strip()

        if obj_text:
            obj_text_clean = re.sub(r"^\d+\s+", "", obj_text)
            # Remove common prefixes that might remain (different, random, more)
            obj_text_clean = re.sub(r"^(different|random|more)\s+", "", obj_text_clean, flags=re.IGNORECASE)
            
            if obj_text_clean and not obj_text_clean.isdigit():
                 if obj_text_clean not in details["values"]:
                     details["values"][obj_text_clean] = 1

    # --- 3. Target Extraction ---
    default_target = "Self" 
    
    if details["action"] in NEGATIVE_ACTIONS:
        default_target = "Enemy"
    elif details["action"] == "Reduce":
        reduced_stat = ""
        if details["values"]:
            stats = [k for k in details["values"].keys() if k not in ["Minimum", "Duration"]]
            if stats:
                reduced_stat = stats[0].lower()
        
        if any(x in reduced_stat for x in ["hits", "cooldown", "cost"]):
            default_target = "This"
        elif "taken" in reduced_stat:
            default_target = "Self"
        else:
            default_target = "Enemy"
    elif details["action"] == "Trigger":
        default_target = "This"
    
    explicit_target_found = False

    subj_match = RE_SUBJECT.search(text)
    if subj_match:
        subject = subj_match.group("subject").strip()
        if subject.lower() == "this":
            details["targets"].append("This")
            explicit_target_found = True
        elif subject.lower() in ["you", "your hero"]:
            details["targets"].append("Self")
            explicit_target_found = True
        else:
            details["targets"].append(subject)
            explicit_target_found = True

    prep_match = RE_TARGET_PREP.search(text)
    if prep_match:
        t = prep_match.group("target").lower()
        if "yourself" in t or "your hero" in t:
            details["targets"].append("Self")
        elif "opponent" in t or "enemy" in t or "another hero" in t:
            details["targets"].append("Enemy")
        elif "both" in t:
            details["targets"].extend(["Self", "Enemy"])
        explicit_target_found = True

    obj_match = RE_OBJ_TARGET.search(text)
    if obj_match:
        obj = obj_match.group("obj").strip()
        obj = re.sub(r"^\d+\s+", "", obj)
        details["targets"].append(obj)
        explicit_target_found = True

    if not explicit_target_found:
        if details["action"] == "Gain":
            gained_stats = [k for k in details["values"].keys() if k != "Chance"]
            if any(stat in ITEM_STATS for stat in gained_stats) or any(stat in s for s in gained_stats for stat in ITEM_STATS):
                 default_target = "This"
        
        details["targets"].append(default_target)

    details["targets"] = list(set(details["targets"]))

    # --- 4. Flags Extraction ---
    if " or " in text.lower():
        details["flags"]["OR"] = True
    if " and " in text.lower():
        details["flags"]["AND"] = True
    
    # Fallback for chance if not at start
    if "Chance" not in details["flags"]:
        chance_match = RE_CHANCE.search(text)
        if chance_match:
            details["flags"]["Chance"] = float(chance_match.group("chance")) / 100.0
        else:
            if RE_CHANCE_WORD.search(text):
                 is_part_of_stat = False
                 for stat in found_stats:
                     if "chance" in stat:
                         is_part_of_stat = True
                         break
                 
                 if not is_part_of_stat:
                    details["flags"]["Chance"] = True

    return details

def parse_trigger_values(trigger_text):
    """
    Extracts numerical parameters from trigger text.
    """
    values = {}
    
    hit_match = RE_TRIG_HIT.search(trigger_text)
    if hit_match:
        values["hits"] = int(hit_match.group(1))
        
    sec_match = RE_TRIG_SEC.search(trigger_text)
    if sec_match:
        val = float(sec_match.group(1))
        if val.is_integer(): val = int(val)
        values["seconds"] = val
        
    hp_match = RE_TRIG_HP.search(trigger_text)
    if hp_match:
        values["health_threshold"] = int(hp_match.group(1))
        
    static_match = RE_TRIG_STATIC.search(trigger_text)
    if static_match:
        values["static_cost"] = int(static_match.group(1))
        
    shop_match = RE_TRIG_SHOP.search(trigger_text)
    if shop_match:
        values["shops"] = int(shop_match.group(1))

    return values

def process_csv(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader) # Skip header "tooltips"
        
        count = 0
        for row in reader:
            if not row: continue
            
            raw_tooltip = row[0]
            # The CSV contains strings like "[""Desc...""]"
            # We need to parse this.
            try:
                # It looks like a JSON array string, but with double quotes escaped as ""
                # csv reader handles the double quotes escaping if configured right, but let's see.
                # If csv reader handled it, raw_tooltip should be `["Desc..."]`
                
                # Let's try to parse it as JSON
                try:
                    tooltips_list = json.loads(raw_tooltip)
                except json.JSONDecodeError:
                    # Fallback if it's not valid JSON directly (maybe single quotes?)
                    try:
                        tooltips_list = ast.literal_eval(raw_tooltip)
                    except:
                        # Just treat as string if all else fails
                        tooltips_list = [raw_tooltip]
                
                if isinstance(tooltips_list, list) and len(tooltips_list) > 0:
                    desc = tooltips_list[0]
                    print(f"\n--- Item {count} ---")
                    print(f"RAW: {desc[:50]}...")
                    parsed = parse_description(desc)
                    print(json.dumps(parsed, indent=2, ensure_ascii=False))
                    count += 1
                    if count >= 10: break # Limit to 10 for testing
            except Exception as e:
                print(f"Error parsing row: {row} -> {e}")

if __name__ == "__main__":
    csv_path = "C:/Users/User/Desktop/PycharmProjects/pythonProject/Code/BackpackInsight/Backend/PlayerData/builds/itemdefinition_202602081521.csv"
    process_csv(csv_path)
