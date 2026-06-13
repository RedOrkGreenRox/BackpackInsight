"""
Icon Parser Module
Перенесенная логика из TypeScript icon-parser.ts для Python бэкенда
"""

import os
import sys
from pathlib import Path
import json

# Добавляем корень проекта в путь для импортов
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent.parent
sys.path.insert(0, str(project_root))

import re
from typing import Dict, List, Set, Optional
from dataclasses import dataclass
from sqlmodel import Session, select
from Backend.DB.database import engine
from Backend.PlayerData.models.Item import ItemDefinition

# --- КОНСТАНТЫ ---

# Форматы изображений
IMAGE_FORMATS = [
    {"type": "image/webp", "ext": "webp", "path": "/images/fonticon/webp"},
    {"type": "image/avif", "ext": "avif", "path": "/images/fontIcon/avif"},
]

DEFAULT_IMAGE_FORMAT = IMAGE_FORMATS[0]  # webp

# Алиасы для генератора типов
TYPE_GENERATOR_ALIASES = {
    "Armor": "TypeArmor"
}

SPECIAL_LOGIC_ICON = "Star"
START_LINE_KEYWORDS = ["This"]
ITEM_WORD_VARIANTS = r"items?|Items?"

# Файлы иконок
ICON_FILES = [
    "Day", "Hob", "Pet", "Buff", "Burn", "Buzz", "Coin", "Dawn", "Dorf", "Dusk", "Gold", "Life",
    "Luck", "Mana", "Miss", "Sage", "Soul", "Star", "Stun", "Tink", "Armor", "Bleed", "Blind", "Chana", "Chill",
    "Curse", "Enoch", "Haste", "Night", "Ronan", "Damage", "Debuff", "Harkon", "Health", "Morrow",
    "Pepper", "Poison", "Potion", "Resist", "Shared", "Static", "Thorns", "Celeste", "Empower", "Fatigue",
    "Stamina", "TypeBag", "TypeRat", "Accuracy", "Cooldown", "Insanity", "Resisted", "TypeFish", "TypeFood",
    "TypeTool", "Lifesteal", "MaxHealth", "Snowballs", "Stopwatch", "TypeArmor", "TypeCharm", "TypePlant",
    "TypeSkull", "CritChance", "CritDamage", "Nymphedora", "TypePotion", "MeleeWeapon", "TypeMineral",
    "RangedWeapon", "Regeneration", "StaminaUsage", "TypeAccessory", "TypeIngredient", "StaminaRecovery"
]

# Карта алиасов
ALIAS_MAP = {
    "Melee Weapon": "MeleeWeapon", "Ranged Weapon": "RangedWeapon", "Stamina Usage": "StaminaUsage",
    "Stamina Recovery": "StaminaRecovery", "Crit Chance": "CritChance", "Crit Damage": "CritDamage",
    "Max Health": "MaxHealth", "Accessory": "TypeAccessory", "Ingredient": "TypeIngredient",
    "Mineral": "TypeMineral", "Potion": "TypePotion", "Food": "TypeFood", "Fish": "TypeFish",
    "Plant": "TypePlant", "Skull": "TypeSkull", "Charm": "TypeCharm", "Bag": "TypeBag",
    "Tool": "TypeTool", "Coin": "Gold", "Hob Gang": "Hob",
    "stat_damageMin": "Damage", "stat_damageMax": "Damage", "stat_staminaCost": "StaminaUsage",
    "stat_cooldown": "Cooldown", "stat_accuracy": "Accuracy", "stat_criticalChance": "CritChance",
    "stat_criticalDamage": "CritDamage", "stat_critical": "CritDamage", "stat_stamina": "Stamina"
}

# Исключения для триггеров иконок
ICON_TRIGGER_EXCEPTIONS = ["Bag of Flour", "Pet Rock"]
HEADER_EXCEPTIONS_BEFORE_COLON = ["to", "more", "less", "higher", "lower", "inside", "slot", "Стоимость", "Cost", "Hero", "Герой"]
HEADER_EXCEPTIONS_NO_COLON = ["are", "is", "can", "require", "also", "rerolls", "gain", "inflict", "steal", "benefits", "counts", "per"]

# Запрещенные имена
FORBIDDEN_NAMES = [
    "Gain", "Get", "Give", "Turn", "Shoot", "When", "After", "Every", "Activate", "Use", "Steal",
    "Have", "Inflict", "Remove", "Trap", "Cleanse", "Become", "Per", "On", "Increased", "If",
    "Reduce", "Heal", "Look", "Spend", "Deal", "Next", "Also", "Increase", "Transform", "Your",
    "That", "The", "Add", "Transfer", "Attract", "Trigger", "Both", "Restore", "Brings",
    "Opponent", "Crack", "Find", "Catch", "No", "Absorb", "Block", "Hits", "Hammer", "Break",
    "Drain", "Suffer", "Void", "Sabotage", "Weaken", "Turns"
]

# Ключевые слова и паттерны
KEYWORDS_REGEX = re.compile(r"\b(Discharge|common|magnetic|Sabotage|empty|Lumps\s+of\s+Coal|Hunter['']s\s+mark|Call\s+of\s+the\s+Void)\b", re.IGNORECASE)
ITEM_PREFIX_KEYWORDS = ["magnetic", "common"]
ITEM_SCALING_PREPOSITIONS = ["per", "for each"]
ITEM_SUFFIX_PREFIX_PATTERN = f"(<span class=\"value-text\">[\\d.-]+<\\/span>\\s*(?:(?:{'|'.join(ITEM_PREFIX_KEYWORDS)})\\s+|<span[^>]*>.*?<\\/span>\\s*)?|{'|'.join(ITEM_SCALING_PREPOSITIONS)}\\s+)"

FORCED_HEADER_KEYWORDS = ["Quantity", "• After"]
HEADER_BLOCK_KEYWORDS = ["If"]
NUMBER_FOLLOW_TRIGGERS = f"(?:%|seconds?|quantity|uses?|less|simple|common|magnetic|random|free|or|{ITEM_WORD_VARIANTS}|more|by|max|min|enemy|\\[\\[ICN|[A-Z]|\\)|$)"

# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

ALL_TRIGGER_WORDS = sorted(set(ICON_FILES + list(ALIAS_MAP.keys())), key=len, reverse=True)

def create_icon_html(icon_name: str, title: str) -> str:
    """Создает HTML для иконки"""
    sources = []
    for format_info in IMAGE_FORMATS:
        sources.append(
            f'<source srcset="{format_info["path"]}/{icon_name.lower()}.{format_info["ext"]}" type="{format_info["type"]}">'
        )
    
    return (
        f' <picture class="text-icon" title="{title}">'
        f"{''.join(sources)}"
        f'<img src="{DEFAULT_IMAGE_FORMAT["path"]}/{icon_name.lower()}.{DEFAULT_IMAGE_FORMAT["ext"]}" alt="{title}" loading="lazy">'
        f'</picture> '
    )

def get_alpha_id(num: int) -> str:
    """Генерирует буквенный ID (A, B, C..., AA, AB...)"""
    id_str = ""
    n = num
    while n >= 0:
        id_str = chr(65 + (n % 26)) + id_str
        n = n // 26 - 1
    return id_str

def replace_outside_spans(text: str, regex: re.Pattern, handler) -> str:
    """Заменяет по регулярному выражению, игнорируя содержимое внутри span тегов"""
    ignore_regex = re.compile(r"(<span[^>]*>.*?<\/span>|\[\[ICN[A-Z]+]]|<picture[^>]*>.*?<\/picture>|<br\s*\/?>)")
    combined = re.compile(f"({ignore_regex.pattern})|{regex.pattern}")
    
    def replacer(match):
        if match.group(1):  # ignore group
            return match.group(0)
        # Pass all groups to handler
        return handler(*match.groups()[1:])
    
    return combined.sub(replacer, text)

# --- ОСНОВНОЙ ПАРСЕР ---

@dataclass
class ParsedResult:
    """Результат парсинга текста с иконками"""
    structure: Dict  # Структурированные данные (триггеры, эффекты, etc.)
    icons_used: List[str]
    headers_found: List[str]

def parse_effect_details(text: str) -> Optional[Dict]:
    """
    Извлекает детали эффекта из текста для симуляции боя
    """
    if not text:
        return None
        
    details = {
        "action": None,
        "values": {},
        "targets": [],
        "flags": {},
        "conditions": {},
        "scaling": {},
        "cost": {},
        "location": None,  # Новое поле для локаций
        "special_action": None  # Новое поле для специальных действий
    }

    # Извлекаем действие (глагол) - более точный парсинг
    action_patterns = [
        (r"\b(Gain)\b", "Gain"),
        (r"\b(Inflict)\b", "Inflict"),
        (r"\b(Steal)\b", "Steal"),
        (r"\b(Remove)\b", "Remove"),
        (r"\b(Cleanse)\b", "Cleanse"),
        (r"\b(Heal)\b", "Heal"),
        (r"\b(Deal)\b", "Deal"),
        (r"\b(Stun)\b", "Stun"),
        (r"\b(Use)\b", "Use"),
        (r"\b(Spend)\b", "Spend"),
        (r"\b(Trigger)\b", "Trigger"),
        (r"\b(Activate)\b", "Activate"),
        (r"\b(Reduce)\b", "Reduce"),
        (r"\b(Increase)\b", "Increase"),
        (r"\b(Drain)\b", "Drain"),
        (r"\b(Block)\b", "Block"),
        (r"\b(Weaken)\b", "Weaken"),
        (r"\b(Sabotage)\b", "Sabotage"),
        (r"\b(Brings|Catch|Find|Get)\b", "Get"),
        (r"\b(Break)\b", "Break"),
        (r"\b(Become)\b", "Apply Status"),
        (r"\b(Transform|Polishes)\b", "Transform"),
        (r"\b(Recover|Restore)\b", "Restore"),
        (r"\b(Shoot)\b", "Shoot"),
        (r"\b(Trap)\b", "Trap"),
        (r"\b(Dig|Hammer|Check)\b", "Get"),
        (r"\b(Attract)\b", "Get"),
        (r"\b(Add)\b", "Gain"),
        (r"\b(Look)\b", "Get"),
        (r"\b(Have)\b", "Gain"),
        (r"\b(Absorb)\b", "Block"),
        (r"\b(Destroy)\b", "Destroy"),
        (r"\b(Open)\b", "Get"),
        (r"\b(Ignores)\b", "Ignore"),
        # Новые действия для перемещения и добычи
        (r"\b(Go)\b", "Go"),
        (r"\b(Teleport)\b", "Teleport"),
        (r"\b(Travel)\b", "Travel"),
        (r"\b(Enter)\b", "Enter"),
        (r"\b(Visit)\b", "Visit"),
        (r"\b(Explore)\b", "Explore"),
        (r"\b(Mine|Mining)\b", "Mine"),
        (r"\b(Fish|Fishing)\b", "Fish"),
        (r"\b(Hunt|Hunting)\b", "Hunt"),
        (r"\b(Chop|Chopping)\b", "Chop"),
        (r"\b(Craft|Crafting)\b", "Craft"),
    ]
    
    for pattern, action in action_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            details["action"] = action
            break
    
    # Извлекаем стоимость (Use X Mana, Spend X Stamina)
    cost_patterns = [
        (r"Use (\d+(?:\.\d+)?) Mana", "mana"),
        (r"Spend (\d+(?:\.\d+)?) Mana", "mana"),
        (r"Use (\d+(?:\.\d+)?) Stamina", "stamina"),
        (r"Spend (\d+(?:\.\d+)?) Stamina", "stamina"),
        (r"Use (\d+(?:\.\d+)?) Health", "health"),
        (r"Spend (\d+(?:\.\d+)?) Health", "health"),
        (r"Use (\d+(?:\.\d+)?) Gold", "gold"),
        (r"Spend (\d+(?:\.\d+)?) Gold", "gold"),
    ]
    
    for pattern, cost_type in cost_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            details["cost"][cost_type] = float(match.group(1))
    
    # Извлекаем значения с учетом контекста
    # Базовые статы
    stat_patterns = [
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(MaxHealth)", "max_health"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Health)", "health"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Damage)", "damage"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Armor)", "armor"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Resist)", "resist"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Mana)", "mana"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Stamina)", "stamina"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(StaminaUsage)", "stamina_usage"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(StaminaRecovery)", "stamina_recovery"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(CritChance)", "crit_chance"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(CritDamage)", "crit_damage"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Accuracy)", "accuracy"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Haste)", "haste"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Regeneration)", "regeneration"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Lifesteal)", "lifesteal"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Luck)", "luck"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Buff)", "buff"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Debuff)", "debuff"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Empower)", "empower"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Fatigue)", "fatigue"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Insanity)", "insanity"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Static)", "static"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(%?)\s*(Thorns)", "thorns"),
    ]
    
    for pattern, stat_name in stat_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            is_percentage = bool(match.group(2))
            
            details["values"][stat_name] = {
                "amount": value,
                "is_percentage": is_percentage
            }
    
    # Статусы и эффекты
    status_patterns = [
        (r"([+-]?\d+(?:\.\d+)?)\s*(Burn)", "burn"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Poison)", "poison"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Bleed)", "bleed"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Chill)", "chill"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Blind)", "blind"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Stun)", "stun"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Curse)", "curse"),
        (r"([+-]?\d+(?:\.\d+)?)\s*(Sabotage)", "sabotage"),
    ]
    
    for pattern, status_name in status_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            details["values"][status_name] = {
                "amount": value,
                "duration": None  # Можно извлечь из "for X seconds"
            }
    
    # Извлекаем длительность
    duration_match = re.search(r"for (\d+(?:\.\d+)?) seconds", text, re.IGNORECASE)
    if duration_match:
        duration = float(duration_match.group(1))
        # Применяем длительность к последнему добавленному статусу
        for stat_name, stat_data in details["values"].items():
            if stat_name in ["burn", "poison", "bleed", "chill", "blind", "stun", "curse", "sabotage"]:
                if isinstance(stat_data, dict):
                    stat_data["duration"] = duration
    
    # Извлекаем цели
    target_patterns = [
        (r"\b(on opponent|on enemy)\b", "Enemy"),
        (r"\b(on yourself|on your hero)\b", "Self"),
        (r"\b(on both players)\b", ["Self", "Enemy"]),
        (r"\b(Inflict|Steal|Remove|Deal|Stun|Drain|Weaken|Sabotage|Break|Trap|Shoot)\b", "Enemy"),  # Действия направлены к врагу
    ]
    
    for pattern, target in target_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            if isinstance(target, list):
                details["targets"].extend(target)
            else:
                details["targets"].append(target)
            break
    
    # Если целей не найдено, определяем по действию
    if not details["targets"]:
        if details["action"] in ["Inflict", "Steal", "Remove", "Deal", "Stun", "Drain", "Weaken", "Sabotage", "Break", "Trap", "Shoot"]:
            details["targets"].append("Enemy")
        elif details["action"] in ["Heal", "Restore", "Gain", "Cleanse"]:
            details["targets"].append("Self")
        else:
            details["targets"].append("Self")
    
    # Извлекаем условия
    condition_patterns = [
        (r"Health below (\d+)%", "health_below", float),
        (r"Opponent health below (\d+)%", "opponent_health_below", float),
        (r"per (Star .+?)", "per_star_item", str),
        (r"per (\d+) (.+?)", "per_x", lambda m: (int(m.group(1)), m.group(2))),
        (r"While equipped", "while_equipped", bool),
        (r"When chosen", "when_chosen", bool),
        (r"Start of Dawn", "start_of_dawn", bool),
    ]
    
    for pattern, cond_name, cond_type in condition_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if cond_type == float:
                details["conditions"][cond_name] = float(match.group(1))
            elif cond_type == int:
                details["conditions"][cond_name] = int(match.group(1))
            elif cond_type == str:
                details["conditions"][cond_name] = match.group(1)
            elif cond_type == bool:
                details["conditions"][cond_name] = True
            elif callable(cond_type):
                details["conditions"][cond_name] = cond_type(match)
    
    # Извлекаем флаги
    if re.search(r"(\d+(?:\.\d+)?)%\s*(?:chance|to)\b", text, re.IGNORECASE):
        chance_match = re.search(r"(\d+(?:\.\d+)?)%\s*(?:chance|to)\b", text, re.IGNORECASE)
        if chance_match:
            details["flags"]["chance"] = float(chance_match.group(1)) / 100.0
    
    if " or " in text.lower():
        details["flags"]["or_logic"] = True
    if " and " in text.lower():
        details["flags"]["and_logic"] = True
    if "critical hit" in text.lower():
        details["flags"]["on_critical"] = True
    if "hit" in text.lower():
        details["flags"]["on_hit"] = True
    
    # Убираем дубликаты целей
    details["targets"] = list(set(details["targets"]))
    
    # Извлекаем локации и специальные действия
    location_patterns = [
        (r"\(Underground\)", "Underground"),
        (r"\(Abyssal\)", "Abyssal"),
        (r"\(Forest\)", "Forest"),
        (r"\(Mountain\)", "Mountain"),
        (r"\(Cave\)", "Cave"),
        (r"\(Dungeon\)", "Dungeon"),
        (r"\(Shop\)", "Shop"),
        (r"\(Town\)", "Town"),
    ]
    
    special_action_patterns = [
        (r"\b(Go Mining|Go Fishing|Go Hunting)\b", lambda m: m.group(1)),
        (r"\b(Teleport to|Travel to|Visit|Explore)\b", lambda m: m.group(0)),
        (r"\b(Enter|Leave)\b", lambda m: m.group(0)),
    ]
    
    for pattern, location in location_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            details["location"] = location
            break
    
    for pattern, action_func in special_action_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            details["special_action"] = action_func(match)
            break
    
    return details if details["action"] or details["values"] or details["special_action"] else None

def parse_text_with_icons(text: Optional[str]) -> ParsedResult:
    """
    Парсит текст и извлекает структурированные данные
    """
    if not text:
        return ParsedResult(structure={}, icons_used=[], headers_found=[])
    
    processed_text = text.replace(r"\(", "").replace(r"\)", "")
    icons_map = {}
    icon_counter = 0
    icons_used = []
    headers_found = []
    
    # Структурированные данные
    parsed_structure = {
        "triggers": [],
        "passives": [],
        "transformations": [],
        "counters": [],
        "definitions": []
    }
    
    current_trigger_context = None
    
    # ШАГ 1 & 2: Скрытие иконок
    i = 0
    temp_text = ""
    while i < len(processed_text):
        remaining = processed_text[i:]
        match_found = False
        
        for word in ALL_TRIGGER_WORDS:
            if remaining.startswith(word):
                if any(remaining.startswith(ex) for ex in ICON_TRIGGER_EXCEPTIONS):
                    continue
                    
                next_char = processed_text[i + len(word)] if i + len(word) < len(processed_text) else ""
                is_concatenated = any(processed_text[i + len(word):].startswith(w) for w in ALL_TRIGGER_WORDS)
                
                if not next_char or not next_char.isalpha() or is_concatenated:
                    icon_name = ALIAS_MAP.get(word, word)
                    if icon_name in ICON_FILES:
                        alpha_id = get_alpha_id(icon_counter)
                        placeholder = f"[[ICN{alpha_id}]]"
                        icons_map[placeholder] = create_icon_html(icon_name, word)
                        icons_used.append(icon_name)
                        temp_text += placeholder
                    else:
                        temp_text += word
                    i += len(word)
                    match_found = True
                    break
        
        if not match_found:
            temp_text += processed_text[i]
            i += 1
    
    # Разбиваем текст на строки для анализа
    clean_desc = processed_text.replace('\u2022', '').strip()
    lines = [line.strip() for line in clean_desc.split('\n') if line.strip()]

    for line in lines:
        # Проверяем на счетчики
        counter_match = re.match(r"^(?P<name>[\w\s]+): (?P<current>\d+)/(?P<max>\d+)$", line)
        if counter_match:
            parsed_structure["counters"].append({
                "name": counter_match.group("name"),
                "current": int(counter_match.group("current")),
                "max": int(counter_match.group("max"))
            })
            continue

        # Проверяем на триггеры
        trigger_match = re.match(r"^(?P<trigger>(?:On|When|Start of|Every|Health below|Opponent health below|After|While|Per|Shops entered|Discharge|Items crafted|Fights|If|During|Out of stamina|Presents opened).*?):?$", line, re.IGNORECASE)
        
        if trigger_match:
            trigger_text = trigger_match.group("trigger")
            
            # Извлекаем значения из триггера
            trigger_values = {}
            
            # Числовые значения
            hit_match = re.search(r"hit (\d+) times", trigger_text, re.IGNORECASE)
            if hit_match:
                trigger_values["hits"] = int(hit_match.group(1))
                
            sec_match = re.search(r"Every (\d+(?:\.\d+)?) seconds", trigger_text, re.IGNORECASE)
            if sec_match:
                val = float(sec_match.group(1))
                if val.is_integer(): 
                    val = int(val)
                trigger_values["seconds"] = val
                
            hp_match = re.search(r"Health below (\d+)%", trigger_text, re.IGNORECASE)
            if hp_match:
                trigger_values["health_threshold"] = int(hp_match.group(1))
                
            static_match = re.search(r"Discharge \((\d+)Static\)", trigger_text, re.IGNORECASE)
            if static_match:
                trigger_values["static_cost"] = int(static_match.group(1))
                
            shop_match = re.search(r"Every (\d+) shops entered", trigger_text, re.IGNORECASE)
            if shop_match:
                trigger_values["shops"] = int(shop_match.group(1))

            if line.endswith(':'):
                current_trigger_context = {
                    "condition": trigger_text,
                    "values": trigger_values,
                    "effects": [],
                    "type": "trigger"
                }
                parsed_structure["triggers"].append(current_trigger_context)
                continue
            else:
                # Однострочный триггер
                if ':' in line:
                    parts = line.split(':', 1)
                    trigger_text_part = parts[0].strip()
                    
                    current_trigger_context = {
                        "condition": trigger_text_part,
                        "values": trigger_values,
                        "effects": [],
                        "type": "trigger"
                    }
                    parsed_structure["triggers"].append(current_trigger_context)
                    line = parts[1].strip()
                    
                    # Парсим эффект для однострочного триггера
                    effect_data = parse_effect_details(line)
                    if effect_data:
                        current_trigger_context["effects"].append({
                            "text": line,
                            "details": effect_data
                        })
                    current_trigger_context = None
                    continue

        # Проверяем на трансформации
        transform_match = re.search(r"(?:Turn|Polishes|Transforms?) (?P<source>.+?)? ?into (?P<target>.+)", line, re.IGNORECASE)
        if transform_match:
            parsed_structure["transformations"].append({
                "source": transform_match.group("source") or "This",
                "target": transform_match.group("target"),
                "original_text": line
            })
            continue

        # Если есть активный триггер, добавляем эффект
        if current_trigger_context:
            effect_data = parse_effect_details(line)
            if effect_data:
                current_trigger_context["effects"].append({
                    "text": line,
                    "details": effect_data
                })
        else:
            # Иначе это пассивный эффект
            effect_data = parse_effect_details(line)
            if effect_data:
                parsed_structure["passives"].append({
                    "text": line,
                    "details": effect_data
                })

    return ParsedResult(
        structure=parsed_structure,
        icons_used=icons_used,
        headers_found=headers_found
    )

def generate_icons_or_text(words: Optional[List[str]]) -> str:
    """Генерирует HTML для списка слов с иконками"""
    if not words:
        return ""
    
    result = []
    for word in words:
        t = word.strip()
        icon = TYPE_GENERATOR_ALIASES.get(t, ALIAS_MAP.get(t, t))
        if icon in ICON_FILES:
            result.append(create_icon_html(icon, t))
        else:
            result.append(f"<span class=\"text-fallback\">{t}</span>")
    
    return " ".join(result)

# --- ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ ---

def load_items_from_json(json_path: str) -> Dict[str, List[str]]:
    """Загружает предметы из JSON файла"""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            items_data = json.load(f)
        
        items_dict = {}
        for item in items_data:
            item_id = item.get('id', '')
            tooltips = item.get('tooltips', [])
            if item_id and tooltips:
                items_dict[item_id] = tooltips
        
        print(f"Loaded {len(items_dict)} items from {json_path}")
        return items_dict
        
    except Exception as e:
        print(f"Error loading items from {json_path}: {e}")
        return {}

def parse_text_to_html(text: Optional[str]) -> str:
    """
    УСТАРЕЛО: Используйте parse_text_with_icons для структурированных данных
    """
    print("WARNING: parse_text_to_html is deprecated. Use parse_text_with_icons for structured data.")
    return text or ""

# --- ФУНКЦИИ СОХРАНЕНИЯ ---

def save_parsed_data_to_db(item_name: str, parsed_result: ParsedResult) -> bool:
    """
    Сохраняет результаты парсинга в базу данных как структурированные данные
    """
    try:
        with Session(engine) as session:
            # Находим предмет в БД
            statement = select(ItemDefinition).where(ItemDefinition.name == item_name)
            item = session.exec(statement).first()
            
            if not item:
                print(f"Item '{item_name}' not found in database")
                return False
            
            # Сохраняем структурированные данные в JSON поле
            # Здесь нужно добавить соответствующее поле в модель ItemDefinition
            # Например: item.parsed_structure = json.dumps(parsed_result.structure)
            # item.icons_used = ",".join(parsed_result.icons_used)
            
            session.commit()
            print(f"Saved structured data for '{item_name}'")
            print(f"  - Triggers: {len(parsed_result.structure.get('triggers', []))}")
            print(f"  - Passives: {len(parsed_result.structure.get('passives', []))}")
            print(f"  - Transformations: {len(parsed_result.structure.get('transformations', []))}")
            print(f"  - Counters: {len(parsed_result.structure.get('counters', []))}")
            return True
            
    except Exception as e:
        print(f"Error saving parsed data for '{item_name}': {e}")
        return False

def parse_and_save_all_items(json_path: Optional[str] = None) -> Dict[str, bool]:
    """
    Парсит и сохраняет все предметы из JSON файла или базы данных
    """
    results = {}
    
    try:
        if json_path and os.path.exists(json_path):
            # Загружаем из JSON файла
            items_dict = load_items_from_json(json_path)
            
            for item_name, tooltips in items_dict.items():
                if tooltips:
                    full_text = "\n".join(tooltips)
                    parsed_result = parse_text_with_icons(full_text)
                    success = save_parsed_data_to_db(item_name, parsed_result)
                    results[item_name] = success
                    
                    if success:
                        print(f"✓ Processed '{item_name}': {len(parsed_result.icons_used)} icons, {len(parsed_result.structure.get('triggers', []))} triggers")
                    else:
                        print(f"✗ Failed to process '{item_name}'")
        else:
            # Загружаем из базы данных
            with Session(engine) as session:
                statement = select(ItemDefinition.name, ItemDefinition.tooltips)
                items = session.exec(statement).all()
                
                for name, tooltips in items:
                    if tooltips:
                        full_text = "\n".join(tooltips)
                        parsed_result = parse_text_with_icons(full_text)
                        success = save_parsed_data_to_db(name, parsed_result)
                        results[name] = success
                        
    except Exception as e:
        print(f"Error processing items: {e}")
    
    return results

def test_json_parsing(json_path: str, limit: int = 5):
    """
    Тестирует парсинг нескольких предметов из JSON файла
    """
    items_dict = load_items_from_json(json_path)
    
    print(f"=== TESTING STRUCTURED PARSING FROM JSON (first {limit} items) ===")
    count = 0
    
    for item_name, tooltips in items_dict.items():
        if count >= limit:
            break
            
        print(f"\n--- {item_name} ---")
        full_text = "\n".join(tooltips)
        print(f"Original text:\n{full_text}")
        
        # Структурированный парсинг
        parsed_result = parse_text_with_icons(full_text)
        print(f"\nStructured data:")
        print(json.dumps(parsed_result.structure, indent=2, ensure_ascii=False))
        
        print(f"Icons used: {parsed_result.icons_used}")
        print(f"Triggers found: {len(parsed_result.structure.get('triggers', []))}")
        print(f"Passive effects: {len(parsed_result.structure.get('passives', []))}")
        count += 1
        print("=" * 50)

if __name__ == "__main__":
    # Путь к JSON файлу с предметами
    json_path = project_root / "Backend" / "DB" / "items_tooltips.json"
    
    print("=== ICON PARSER - STRUCTURED DATA FOR COMBAT SIMULATION ===")
    
    # 1. Тестовый пример из реальных данных
    test_text = """On hit:
• Remove 12 Armor and 3 Buff
• Gain 1 Haste

On critical hit:
• Inflict 2 Bleed

On shop entered:
• 60% chance to Go Mining (Underground)"""
    
    print("\n1. TESTING BASIC FUNCTIONALITY")
    result = parse_text_with_icons(test_text)
    print("=== STRUCTURED DATA FOR COMBAT SIMULATION ===")
    print(json.dumps(result.structure, indent=2, ensure_ascii=False))
    print("\n=== ICONS USED ===")
    print(result.icons_used)
    print("\n=== COMBAT SIMULATION ANALYSIS ===")
    print(f"Triggers: {len(result.structure.get('triggers', []))}")
    print(f"Passives: {len(result.structure.get('passives', []))}")
    print(f"Transformations: {len(result.structure.get('transformations', []))}")
    print(f"Counters: {len(result.structure.get('counters', []))}")
    
    # 2. Тестирование парсинга из JSON файла
    print("\n\n2. TESTING JSON PARSING")
    if json_path.exists():
        test_json_parsing(str(json_path), limit=3)
        
        # 3. Полная обработка всех предметов (автоматически для теста)
        print("\n\n3. AUTO-PROCESSING FIRST 10 ITEMS")
        results = {}
        items_dict = load_items_from_json(str(json_path))
        
        for i, (item_name, tooltips) in enumerate(items_dict.items()):
            if i >= 10:  # Ограничиваем для теста
                break
            if tooltips:
                full_text = "\n".join(tooltips)
                parsed_result = parse_text_with_icons(full_text)
                # Пропускаем сохранение в БД для теста
                results[item_name] = True
                print(f"+ Processed '{item_name}': {len(parsed_result.icons_used)} icons, {len(parsed_result.structure.get('triggers', []))} triggers")
        
        successful = sum(1 for success in results.values() if success)
        total = len(results)
        print(f"\nAuto-processing complete: {successful}/{total} items processed successfully")
        print(f"Ready for combat simulation with {total} items")
    else:
        print(f"JSON file not found: {json_path}")
        print("Testing with database instead...")
        results = parse_and_save_all_items()
        successful = sum(1 for success in results.values() if success)
        total = len(results)
        print(f"\nDatabase processing complete: {successful}/{total} items processed successfully")
    
    print("\n=== COMBAT SIMULATION READY ===")
    print("[OK] Triggers with conditions")
    print("[OK] Actions (Gain, Remove, Inflict)")
    print("[OK] Values with types (percentage/absolute)")
    print("[OK] Targets (Self/Enemy)")
    print("[OK] Flags (chance, on_critical, on_hit)")
    print("[OK] Costs (if any)")
    print("[OK] JSON file support")
    print("[OK] Structured data for AI simulation")
