"""
Icon Parser Module
Синхронизировано с фронтенд-версией (icon-parser.ts).
Поддерживает генерацию HTML и структурированный парсинг для симуляции.
"""

import os
import sys
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple, Any, Union
from dataclasses import dataclass, field

# Добавляем корень проекта в путь для импортов
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlmodel import Session, select
from Backend.DB.database import engine
from Backend.PlayerData.models.Item import ItemDefinition

# --- КОНСТАНТЫ (Синхронизировано с TS) ---

DEFAULT_TEXT_CLASS = 'text-default'

IMAGE_FORMATS = [
    {"type": "image/webp", "ext": "webp", "path": "/images/fonticon/webp"},
    {"type": "image/avif", "ext": "avif", "path": "/images/fonticon/avif"},
]

DEFAULT_IMAGE_FORMAT = IMAGE_FORMATS[0]  # webp

TYPE_GENERATOR_ALIASES = {
    "Armor": "TypeArmor"
}

SPECIAL_LOGIC_ICON = "Star"
START_LINE_KEYWORDS = ["This"]
ITEM_WORD_VARIANTS = r"items?|Items?"

ICON_FILES = [
    "Day", "Hob", "Pet", "Buff", "Burn", "Buzz", "Coin", "Dawn", "Dorf", "Dusk", "Gold", "Life",
    "Luck", "Mana", "Miss", "Sage", "Soul", "Star", "Stun", "Tink", "Armor", "Bleed", "Blind", "Chana", "Chill",
    "Curse", "Enoch", "Haste", "Night", "Ronan", "Damage", "Debuff", "Harkon", "Health", "Morrow",
    "Pepper", "Poison", "Potion", "Resist", "Shared", "Static", "Thorns", "Celeste", "Empower", "Fatigue",
    "Stamina", "TypeBag", "TypeRat", "Accuracy", "Cooldown", "Insanity", "Resisted", "TypeFish", "TypeFood",
    "TypeTool", "Lifesteal", "MaxHealth", "Snowballs", "Stopwatch", "TypeArmor", "TypeCharm", "TypePlant",
    "TypeSkull", "CritChance", "CritDamage", "Nymphedora", "TypePotion", "MeleeWeapon", "TypeMineral",
    "RangedWeapon", "Regeneration", "StaminaUsage", "TypeAccessory", "TypeIngredient", "StaminaRecovery",
    "Fern", "Zahir", "CrashTestDucky", "Kragg"
]

# Карта алиасов
ALIAS_MAP = {
    "Crash Test Ducky": "CrashTestDucky",
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

ICON_TRIGGER_EXCEPTIONS = [
    "Bag of Flour", "Pet Rock", "Brown Rat", "White Rat", "Giant Rat", 
    "Rat King", "Pack Rat", "Fire Rat", "Ice Rat", "Shadow Rat", "Rat Swarm"
]
HEADER_EXCEPTIONS_BEFORE_COLON = ["to", "more", "less", "higher", "lower", "inside", "slot", "Стоимость", "Cost", "Hero", "Герой"]
HEADER_EXCEPTIONS_NO_COLON = ["are", "is", "can", "require", "also", "rerolls", "gain", "inflict", "steal", "benefits", "counts", "per"]

FORBIDDEN_NAMES = {
    "Gain", "Get", "Give", "Turn", "Shoot", "When", "After", "Every", "Activate", "Use", "Steal",
    "Have", "Inflict", "Remove", "Trap", "Cleanse", "Become", "Per", "On", "Increased", "If",
    "Reduce", "Heal", "Look", "Spend", "Deal", "Next", "Also", "Increase", "Transform", "Your",
    "That", "The", "Add", "Transfer", "Attract", "Trigger", "Both", "Restore", "Brings",
    "Opponent", "Crack", "Find", "Catch", "No", "Absorb", "Block", "Hits", "Hammer", "Break",
    "Drain", "Suffer", "Void", "Sabotage", "Weaken", "Turns", "Can"
}

KEYWORDS_REGEX = re.compile(r"\b(Discharge|common|magnetic|Sabotage|empty|Lumps\s+of\s+Coal|Hunter['’]s\s+mark|Call\s+of\s+the\s+Void)\b", re.IGNORECASE)
ITEM_PREFIX_KEYWORDS = ["magnetic", "common"]
ITEM_SCALING_PREPOSITIONS = ["per", "for each"]
ITEM_SUFFIX_PREFIX_PATTERN = f"(<span class=\"value-text\">[\\d.-]+<\\/span>\\s*(?:(?:{'|'.join(ITEM_PREFIX_KEYWORDS)})\\s+|<span[^>]*>.*?<\\/span>\\s*)?|{'|'.join(ITEM_SCALING_PREPOSITIONS)}\\s+)"

FORCED_HEADER_KEYWORDS = ["Quantity", "• After"]
HEADER_BLOCK_KEYWORDS = ["If"]
NUMBER_FOLLOW_TRIGGERS = f"(?:%|seconds?|quantity|uses?|less|simple|common|magnetic|random|free|or|{ITEM_WORD_VARIANTS}|more|by|max|min|enemy|\\[\\[ICN|[A-Z]|\\)|$)"

# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

ALL_TRIGGER_WORDS = sorted(list(set(ICON_FILES + list(ALIAS_MAP.keys()))), key=len, reverse=True)

def create_icon_html(icon_name: str, title: str) -> str:
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
    id_str = ""
    n = num
    while n >= 0:
        id_str = chr(65 + (n % 26)) + id_str
        n = n // 26 - 1
    return id_str

def replace_outside_spans(text: str, regex: Union[re.Pattern, str], handler) -> str:
    if isinstance(regex, str):
        regex = re.compile(regex)
        
    # Игнорируем существующие теги
    ignore_patterns = [
        r'<span[^>]*>.*?</span>',
        r'\[\[ICN[A-Z]+]]',
        r'<picture[^>]*>.*?</picture>',
        r'<br\s*/?>'
    ]
    ignore_regex_str = f"({'|'.join(ignore_patterns)})"
    
    # Комбинируем: (игнорируемое)|(цель)
    # Используем именованную группу для игнорирования
    combined_regex = re.compile(f"{ignore_regex_str}|({regex.pattern})", re.DOTALL if "DOTALL" in str(regex.flags) else 0)
    
    def replacer(match):
        if match.group(1): # Группа игнорирования
            return match.group(1)
        
        # Передаем все группы цели в хендлер (исключая первую группу игнорирования)
        # В Python re.sub передает объект match. Мы извлекаем нужные группы.
        target_groups = match.groups()[1:] # Группы после первой
        # Фильтруем None
        valid_groups = [g for g in target_groups if g is not None]
        
        # Если хендлер принимает match, передаем его, иначе группы
        try:
            # Пытаемся вызвать с группами
            return handler(*valid_groups)
        except TypeError:
            # Если не вышло, пробуем с одним аргументом (полное совпадение цели)
            return handler(match.group(0))

    return combined_regex.sub(replacer, text)

# --- ОСНОВНОЙ ПАРСЕР ---

@dataclass
class ParsedResult:
    html: str
    structure: Dict[str, Any] = field(default_factory=lambda: {
        "triggers": [],
        "passives": [],
        "transformations": [],
        "counters": [],
        "definitions": []
    })
    icons_used: List[str] = field(default_factory=list)

def parse_effect_details(text: str) -> Optional[Dict[str, Any]]:
    """Извлекает детали эффекта (Действие, Значения, Цели)"""
    if not text: return None
    details = {"action": None, "values": {}, "targets": [], "flags": {}, "conditions": {}, "scaling": {}, "cost": {}}

    action_patterns = [
        (r"\b(Gain)\b", "Gain"), (r"\b(Inflict)\b", "Inflict"), (r"\b(Steal)\b", "Steal"),
        (r"\b(Remove)\b", "Remove"), (r"\b(Cleanse)\b", "Cleanse"), (r"\b(Heal)\b", "Heal"),
        (r"\b(Deal)\b", "Deal"), (r"\b(Stun)\b", "Stun"), (r"\b(Use)\b", "Use"),
        (r"\b(Spend)\b", "Spend"), (r"\b(Trigger)\b", "Trigger"), (r"\b(Activate)\b", "Activate"),
        (r"\b(Reduce)\b", "Reduce"), (r"\b(Increase)\b", "Increase"), (r"\b(Drain)\b", "Drain"),
        (r"\b(Block)\b", "Block"), (r"\b(Weaken)\b", "Weaken"), (r"\b(Sabotage)\b", "Sabotage"),
        (r"\b(Brings|Catch|Find|Get)\b", "Get"), (r"\b(Break)\b", "Break")
    ]
    for p, a in action_patterns:
        if re.search(p, text, re.IGNORECASE):
            details["action"] = a
            break
            
    # Парсинг статов (упрощенно)
    stats = ["Damage", "Health", "Armor", "Mana", "Stamina", "Luck", "Poison", "Burn", "Bleed"]
    for stat in stats:
        match = re.search(rf"(\d+)\s*{stat}", text, re.IGNORECASE)
        if match: details["values"][stat.lower()] = int(match.group(1))
        
    return details if details["action"] or details["values"] else None

def parse_text_with_icons(text: Optional[str]) -> ParsedResult:
    if not text:
        return ParsedResult(html="")

    # Предварительная обработка скобок
    processed_text = re.sub(r"\\\(([^)]+)\\\)", lambda m: re.sub(r'[^a-zA-Zа-яА-Я]', '', m.group(1)), text)
    
    icons_map = {}
    icon_counter = 0
    icons_used = []

    # ШАГ 1 & 2: Скрытие иконок
    i = 0
    temp_text = ""
    while i < len(processed_text):
        remaining = processed_text[i:]
        match_found = False
        for word in ALL_TRIGGER_WORDS:
            if remaining.startswith(word):
                if any(remaining.startswith(ex) for ex in ICON_TRIGGER_EXCEPTIONS): continue
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
                        icon_counter += 1
                    else:
                        temp_text += word
                    i += len(word)
                    match_found = True
                    break
        if not match_found:
            temp_text += processed_text[i]
            i += 1
    processed_text = temp_text

    # ШАГ 3: Заголовки
    forced_part = "|".join([re.escape(k) for k in FORCED_HEADER_KEYWORDS])
    block_part = "|".join(HEADER_BLOCK_KEYWORDS)
    header_pattern = re.compile(
        rf"(^|\n|\\n)((?:(?:{forced_part})[^:\n\\•]+|(?![ \t]*[•+](?![^:\n\\]*:))"
        rf"(?![ \s•]*\d+%)(?!(?:\s*{block_part}\b)(?![^:\n\\]*:))[^:\n\\•]{{1,60}}))(:|(?=\n)|$)",
        re.MULTILINE
    )

    def header_replacer(start, content, end):
        if not content.strip(): return start + content + end
        trimmed = content.strip()
        end_ex = re.compile(rf"\b({'|'.join(HEADER_EXCEPTIONS_BEFORE_COLON)})\b$", re.IGNORECASE)
        no_col_ex = re.compile(rf"\b({'|'.join(HEADER_EXCEPTIONS_NO_COLON)})\b", re.IGNORECASE)
        if end == ":" and end_ex.search(trimmed): return start + content + end
        if not end and no_col_ex.search(content): return start + content + end
        return f"{start}<span class=\"value-text\">{content}{end}</span>"

    processed_text = header_pattern.sub(lambda m: header_replacer(m.group(1), m.group(2), m.group(3) or ""), processed_text)

    # ШАГ 4 & 5: Проценты и числа
    processed_text = replace_outside_spans(processed_text, r"(\(\s*[+-]\d+%.*?\))|([+-]?\d+%)", lambda m: f'<span class="value-text">{m}</span>')
    num_regex = rf"(?<!/)([+-]?[\d.]+(?:-[\d.]+)?|[\d.]+)(\s*){NUMBER_FOLLOW_TRIGGERS}"
    processed_text = replace_outside_spans(processed_text, num_regex, lambda n, s, f: f'<span class="value-text">{n}%</span>{s}' if f == '%' else f'<span class="value-text">{n}</span>{s}{f}')

    # ШАГ 6: Ключевые слова
    processed_text = replace_outside_spans(processed_text, r"\b(by\s+)([\d.]+)\b", lambda b, n: f'{b}<span class="value-text">{n}</span>')
    processed_text = re.sub(r"(^|\n|\\n)([A-Z][a-z]+\s+)([\d.]+(?:-[\d.]+)?)$", lambda m: f"{m.group(1)}{m.group(2)}<span class=\"value-text\">{m.group(3)}</span>" if "span" not in m.group(3) else m.group(0), processed_text, flags=re.M)

    # Имена предметов
    item_names_regex = r"(?<!\()\b([A-Z][a-z]+(?:['’]s)?((?:\s+of)?\s+[A-Z][a-z]+(?:['’]s)?){0,3})\b"
    processed_text = replace_outside_spans(processed_text, item_names_regex, lambda m: m if m.split()[0] in FORBIDDEN_NAMES else f'<span class="value-text">{m}</span>')

    # Шаг 6.1: Star Logic
    for placeholder, html in icons_map.items():
        if f'title="{SPECIAL_LOGIC_ICON}"' in html:
            follow_regex = re.compile(rf"({re.escape(placeholder)}[ \xA0\t]*)({ITEM_WORD_VARIANTS}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)")
            processed_text = follow_regex.sub(lambda m: f'{m.group(1)}<span class="value-text">{m.group(2)}</span>', processed_text)

    processed_text = replace_outside_spans(processed_text, KEYWORDS_REGEX, lambda m: f'<span class="value-text">{m}</span>')

    # Шаг 6.2: Item word coloring
    item_suffix_regex = re.compile(rf"{ITEM_SUFFIX_PREFIX_PATTERN}({ITEM_WORD_VARIANTS})\b", re.IGNORECASE)
    processed_text = item_suffix_regex.sub(lambda m: f'{m.group(1)}<span class="value-text">{m.group(2)}</span>', processed_text)

    # Шаг 7: Структурированный парсинг (для симуляции)
    structure = {"triggers": [], "passives": [], "transformations": [], "counters": []}
    lines = [line.strip() for line in processed_text.replace('\u2022', '').split('\n') if line.strip()]
    current_trigger = None
    for line in lines:
        t_match = re.match(r"^(On|When|Start of|Every|Health below|Opponent health below|After|While|Per).*?:?$", line, re.I)
        if t_match:
            current_trigger = {"condition": line, "effects": []}
            structure["triggers"].append(current_trigger)
        elif current_trigger:
            current_trigger["effects"].append({"text": line, "details": parse_effect_details(line)})
        else:
            structure["passives"].append({"text": line, "details": parse_effect_details(line)})

    # Финальная сборка HTML
    for placeholder, html in icons_map.items():
        processed_text = processed_text.replace(placeholder, html)
    
    processed_text = processed_text.replace('\\n', '<br>')
    
    # Обертка обычного текста
    raw_text_regex = r"([^<>\n\r•]+)(?![^<]*>)"
    def raw_wrap(match):
        m = match.group(0)
        if not m.strip(): return m
        return f'<span class="{DEFAULT_TEXT_CLASS}">{m}</span>'
    processed_text = replace_outside_spans(processed_text, raw_text_regex, raw_wrap)

    return ParsedResult(html=processed_text, structure=structure, icons_used=icons_used)

if __name__ == "__main__":
    test = "On hit: Gain 5 Damage. Every 2 seconds: Inflict 3 Poison."
    res = parse_text_with_icons(test)
    print(res.html)
