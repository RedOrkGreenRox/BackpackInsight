import re
import json
from sqlmodel import select, Session
from Backend.DB.database import engine
from Backend.PlayerData.models.Item import ItemDefinition
# Import Profile and Hero to ensure they are registered in SQLModel/SQLAlchemy
from Backend.PlayerData.models.Profile import Profile
from Backend.PlayerData.models.Hero import Hero

# --- CONSTANTS & CONFIGURATION ---

KNOWN_TYPES = [
    "MeleeWeapon", "RangedWeapon", "Pet", "Food", "Plant", "Mineral", 
    "Armor", "Shield", "Helmet", "Boots", "Gloves", "Accessory", 
    "Gem", "Potion", "Mana", "Gold", "Toy", "Holy", "Dark", "Magic"
]

POSITIVE_ACTIONS = ["Gain", "Heal", "Cleanse", "Get", "Activate", "Block", "Trigger", "Recover", "Restore", "Add", "Open"]
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
    r"^(?P<verb>Gain|Inflict|Steal|Remove|Cleanse|Heal|Deal|Stun|Use|Spend|Trigger|Activate|Reduce|Increase|Drain|Block|Weaken|Sabotage|Brings|Catch|Find|Get|Break|Become|Transform|Recover|Restore|Shoot|Trap|Dig|Hammer|Check|Attract|Add|Look|Have|Polishes|Absorb|Destroy|Open|Ignores)",
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
    if details["action"] in ["Trigger", "Activate", "Get", "Break", "Shoot", "Trap", "Restore", "Dig", "Hammer", "Check", "Absorb", "Destroy", "Have", "Open", "Cleanse"]:
        obj_text = re.sub(r"^(Trigger|Activate|Get|Brings|Catch|Find|Break|Shoot|Trap|Restore|Dig|Hammer|Check|Attract|Absorb|Destroy|Have|Open|Cleanse)\s+(you\s+)?(an|a|the|random|for)?\s*", "", text, flags=re.IGNORECASE).strip()
        obj_text = re.sub(r"^\d+% chance (to )?(get|catch|find|trigger|activate|shoot|trap|dig|hammer|check|absorb|destroy|open|cleanse)\s+(an|a|the)?\s*", "", obj_text, flags=re.IGNORECASE).strip()
        obj_text = re.split(r"\s+(per|on|if|to)\s+", obj_text)[0]
        obj_text = re.sub(r"\(.*?\)", "", obj_text).strip()
        
        if "random" in text.lower():
            details["flags"]["Random"] = True
            obj_text = re.sub(r"\brandom\b", "", obj_text, flags=re.IGNORECASE).strip()

        if obj_text:
            obj_text_clean = re.sub(r"^\d+\s+", "", obj_text)
            if obj_text_clean and not obj_text_clean.isdigit() and obj_text_clean not in details["values"]:
                 # Use the object name as key, value 1 (or extracted amount if possible, but here we default to 1 if not found in values)
                 # Check if we already extracted an amount for this object in RE_VALUES?
                 # RE_VALUES extracts "1 Star Bolt". "Star Bolt" is the stat.
                 # If RE_VALUES worked, we might have it.
                 # But "Hot Choconut" might not match RE_VALUES if it doesn't look like a stat.
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
    
    chance_match = RE_CHANCE.search(text)
    if chance_match:
        # Convert percentage to probability (0.0 - 1.0)
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

def parse_description(description):
    """
    Parses a raw item description into structured data.
    """
    if not description:
        return {}

    # Pre-process / Normalize text
    description = normalize_text(description)

    clean_desc = description.replace('\u2022', '').strip()
    lines = [line.strip() for line in clean_desc.split('\n') if line.strip()]

    parsed_data = {
        "triggers": [],
        "passives": [],
        "transformations": [],
        "counters": [],
        "definitions": []
    }

    current_trigger_context = None

    for line in lines:
        # Check for Counter lines
        counter_match = RE_COUNTER.match(line)
        if counter_match:
            parsed_data["counters"].append({
                "name": counter_match.group("name"),
                "current": int(counter_match.group("current")),
                "max": int(counter_match.group("max"))
            })
            continue

        # Check for Definition lines (Keyword:)
        # But exclude Triggers which also end in :
        trigger_match = RE_TRIGGER.match(line)
        if not trigger_match:
            def_match = RE_DEFINITION.match(line)
            if def_match:
                # It's a definition like "Weaken:" or "Call of the Void:"
                # We can treat it as a trigger context so subsequent lines belong to it
                current_trigger_context = {
                    "condition": def_match.group("name"),
                    "values": {},
                    "effects": [],
                    "type": "definition"
                }
                parsed_data["definitions"].append(current_trigger_context)
                continue

        transform_match = RE_TRANSFORM.search(line)
        if transform_match:
            parsed_data["transformations"].append({
                "source": transform_match.group("source") or "This",
                "target": transform_match.group("target"),
                "original_text": line
            })
            continue

        is_one_line_trigger = False

        if trigger_match:
            trigger_text = trigger_match.group("trigger")

            # Normalize trigger text parens if any left
            parens_match = RE_PARENS.search(trigger_text)
            if parens_match:
                content = parens_match.group("content")
                split_tags = split_combined_types(content)
                if split_tags:
                    new_content = ", ".join(split_tags)
                    trigger_text = trigger_text.replace(content, new_content)

            trigger_values = parse_trigger_values(trigger_text)

            if line.endswith(':'):
                current_trigger_context = {
                    "condition": trigger_text,
                    "values": trigger_values,
                    "effects": [],
                    "type": "trigger"
                }
                parsed_data["triggers"].append(current_trigger_context)
                continue
            else:
                if ':' in line:
                    parts = line.split(':', 1)
                    trigger_text_part = parts[0].strip()

                    parens_match = RE_PARENS.search(trigger_text_part)
                    if parens_match:
                        content = parens_match.group("content")
                        split_tags = split_combined_types(content)
                        if split_tags:
                            new_content = ", ".join(split_tags)
                            trigger_text_part = trigger_text_part.replace(content, new_content)

                    trigger_values = parse_trigger_values(trigger_text_part)

                    current_trigger_context = {
                        "condition": trigger_text_part,
                        "values": trigger_values,
                        "effects": [],
                        "type": "trigger"
                    }
                    parsed_data["triggers"].append(current_trigger_context)
                    line = parts[1].strip()
                    is_one_line_trigger = True
                else:
                    pass

        cost_match = RE_COST.search(line)
        cost = cost_match.group("cost") if cost_match else None

        scaling_match = RE_SCALING.search(line)
        scaling = scaling_match.group("scaling") if scaling_match else None

        tags = []
        combined_match = RE_COMBINED_TYPES.search(line)
        if combined_match:
            word = combined_match.group(0).replace("Star ", "")
            split_tags = split_combined_types(word)
            if split_tags:
                tags = split_tags

        effect_text = line
        if cost: effect_text = effect_text.replace(cost, "").strip()
        if scaling: effect_text = effect_text.replace(scaling, "").strip()

        if effect_text.lower().startswith("to "): effect_text = effect_text[3:]
        effect_text = effect_text.strip(',. ')

        details = parse_effect_details(effect_text)

        effect_obj = {
            "text": effect_text,
            "cost": cost,
            "scaling": scaling,
            "tags": tags if tags else None,
            "details": details
        }

        if current_trigger_context:
            current_trigger_context["effects"].append(effect_obj)
            if is_one_line_trigger:
                current_trigger_context = None
        else:
            parsed_data["passives"].append(effect_obj)

    return parsed_data

def get_item_tooltips_from_db():
    item_tooltips = {}
    with Session(engine) as session:
        statement = select(ItemDefinition.name, ItemDefinition.tooltips)
        results = session.exec(statement).all()
        for name, tooltips in results:
            if tooltips:
                full_desc = "\n".join(tooltips)
                item_tooltips[name] = full_desc
    return item_tooltips

if __name__ == "__main__":
    # --- CONFIGURATION ---
    PRETTY_PRINT = True  # Set to False for raw JSON output
    # ---------------------

    print("--- Fetching items from DB... ---")
    tooltips = get_item_tooltips_from_db()
    print(f"Found {len(tooltips)} items with descriptions.")
    
    print("\n--- Parsing Descriptions ---")
    for name, desc in tooltips.items():
        if not desc.strip(): continue
        parsed = parse_description(desc)
        
        if parsed["triggers"] or parsed["transformations"] or parsed["passives"] or parsed["counters"] or parsed["definitions"]:
            if PRETTY_PRINT:
                print(f"\n📦 {name}")
                if parsed["triggers"]:
                    print("  ⚡ Triggers:")
                    for t in parsed["triggers"]:
                        val_str = f" {t['values']}" if t.get('values') else ""
                        print(f"    - {t['condition']}{val_str}")
                        
                        for e in t['effects']:
                            d = e['details']
                            vals = ", ".join([f"{k}: {v}" for k, v in d['values'].items()])
                            flags_str = ", ".join([f"{k}: {v}" for k, v in d['flags'].items()])
                            print(f"      -> {d['action']} [{vals}] -> {d['targets']} (Flags: {{{flags_str}}})")
                            if e['cost']: print(f"         (Cost: {e['cost']})")
                            if e['scaling']: print(f"         (Scale: {e['scaling']})")

                if parsed["definitions"]:
                    print("  📖 Definitions:")
                    for t in parsed["definitions"]:
                        print(f"    - {t['condition']}")
                        for e in t['effects']:
                            d = e['details']
                            vals = ", ".join([f"{k}: {v}" for k, v in d['values'].items()])
                            print(f"      -> {d['action']} [{vals}]")

                if parsed["passives"]:
                    print("  🛡️ Passives:")
                    for p in parsed["passives"]:
                        d = p['details']
                        vals = ", ".join([f"{k}: {v}" for k, v in d['values'].items()])
                        flags_str = ", ".join([f"{k}: {v}" for k, v in d['flags'].items()])
                        print(f"    - {d['action']} [{vals}] -> {d['targets']} (Flags: {{{flags_str}}})")

                if parsed["transformations"]:
                    print("  🔄 Transformations:")
                    for t in parsed["transformations"]:
                        print(f"    - {t['source']} -> {t['target']}")
                
                if parsed["counters"]:
                    print("  🔢 Counters:")
                    for c in parsed["counters"]:
                        print(f"    - {c['name']}: {c['current']}/{c['max']}")
            else:
                # Raw JSON output
                print(f"\n📦 ITEM: {name}")
                print(json.dumps(parsed, indent=2, ensure_ascii=False))
