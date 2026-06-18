# Icon Parser - Структурированный парсер игровых предметов

## Назначение

Модуль `icon_parser.py` предназначен для парсинга текстовых описаний игровых предметов из JSON файла и преобразования их в структурированные данные для симуляции боя.

## Основные функции

### `parse_text_with_icons(text: str) -> ParsedResult`

Главная функция парсинга, которая возвращает структурированные данные:

```python
result = parse_text_with_icons("On hit:\n• Remove 12 Armor and 3 Buff")
print(result.structure)
```

### `load_items_from_json(json_path: str) -> Dict[str, List[str]]`

Загружает предметы из JSON файла:

```python
items = load_items_from_json("Backend/DB/items_tooltips.json")
print(f"Loaded {len(items)} items")
```

### Структура выходных данных

```python
@dataclass
class ParsedResult:
    structure: Dict  # Структурированные данные
    icons_used: List[str]  # Список использованных иконок
    headers_found: List[str]  # Найденные заголовки
```

## Структурированные данные

Парсер извлекает следующие типы данных:

### Триггеры (Triggers)
- Условия активации (On hit, When chosen, Start of Dawn, etc.)
- Значения триггеров (seconds, shops, health_threshold, etc.)
- Эффекты триггеров

### Эффекты (Effects)
- **Действия**: Gain, Remove, Inflict, Heal, Deal, Go, Mine, Fish, etc.
- **Значения**: armor, health, damage, haste, etc. с указанием типа (absolute/percentage)
- **Цели**: Self, Enemy, both players
- **Флаги**: chance, on_critical, on_hit, and_logic, or_logic
- **Стоимость**: mana, stamina, health, gold
- **Длительность**: для статусов (burn, poison, bleed, etc.)
- **Локации**: Underground, Abyssal, Forest, Mountain, etc.
- **Специальные действия**: Go Mining, Go Fishing, Teleport to, etc.

### Прочие данные
- **Трансформации**: превращение предметов
- **Счетчики**: прогресс баров (Shops entered: 0/4)
- **Пассивные эффекты**: постоянные эффекты без триггеров

## Пример использования

```python
from icon_parser import parse_text_with_icons, load_items_from_json

# Загрузка предметов из JSON
items = load_items_from_json("Backend/DB/items_tooltips.json")

# Парсинг конкретного предмета
item_name = "Adamantite Axepick"
tooltips = items[item_name]
full_text = "\n".join(tooltips)

result = parse_text_with_icons(full_text)

# Анализ результатов
print(f"Item: {item_name}")
print(f"Triggers: {len(result.structure.get('triggers', []))}")
print(f"Icons: {result.icons_used}")

# Детальный анализ триггеров
for trigger in result.structure.get('triggers', []):
    print(f"\nTrigger: {trigger['condition']}")
    for effect in trigger['effects']:
        details = effect['details']
        print(f"  Action: {details['action']}")
        print(f"  Values: {details['values']}")
        print(f"  Targets: {details['targets']}")
        if details.get('location'):
            print(f"  Location: {details['location']}")
        if details.get('special_action'):
            print(f"  Special Action: {details['special_action']}")
```

## Пример обработки "Go Mining"

```json
{
  "text": "60% chance to Go Mining (Underground)",
  "details": {
    "action": "Go",
    "values": {},
    "targets": ["Self"],
    "flags": {"chance": 0.6},
    "conditions": {},
    "scaling": {},
    "cost": {},
    "location": "Underground",
    "special_action": "Go Mining"
  }
}
```

## Интеграция с симуляцией боя

Структурированные данные готовы для использования в AI симуляции:

```python
# Пример использования в симуляции
def simulate_item_effect(item_data, character_state):
    for trigger in item_data.structure.get('triggers', []):
        if check_trigger_condition(trigger['condition'], character_state):
            for effect in trigger['effects']:
                apply_effect(effect['details'], character_state)
```

## Тестирование

Запуск тестов:
```bash
python icon_parser.py
```

Скрипт автоматически:
1. Тестирует базовую функциональность на примере
2. Парсит первые 3 предмета из JSON
3. Обрабатывает первые 10 предметов для проверки производительности

## Производительность

- Обработка 926 предметов из JSON файла
- Среднее время: ~0.1с на предмет
- Выделение всех игровых механик для AI анализа
- Поддержка сложных условий и масштабируемых эффектов

## Совместимость

- Python 3.8+
- Работает с plain-text данными из JSON
- Не требует HTML или Frontend зависимостей
- Готов для интеграции с PostgreSQL через SQLModel
