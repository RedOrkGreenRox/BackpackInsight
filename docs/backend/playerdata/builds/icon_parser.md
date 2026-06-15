# [Парсер иконок (бэкенд) (icon_parser.py)](../../../../Backend/PlayerData/builds/icon_parser.py)

## Назначение
Python-копия фронтового [icon-parser.ts](../../../frontend/ground/utils/icon-parser.md): превращает сырые игровые описания (`tooltips`) в обогащённый HTML с иконками статов/механик. Может пакетно парсить все предметы и сохранять результат в БД.

## Связи (Dependencies)
*   [Конфигурация БД (database.py)](../../db/database.md): `engine` для чтения/записи.
*   [Модель предмета (Item.py)](../models/Item.md): `ItemDefinition`.
*   Ассеты иконок: `/images/fonticon/{webp,avif}`.
*   Соседний [README_icon_parser.md](../../../../Backend/PlayerData/builds/README_icon_parser.md) — оригинальная заметка по парсеру.

## Константы и конфигурация
*   `IMAGE_FORMATS`/`DEFAULT_IMAGE_FORMAT` — webp (по умолчанию) и avif.
*   `ICON_FILES` — список имён иконок (статы, герои, типы предметов).
*   `ALIAS_MAP`/`TYPE_GENERATOR_ALIASES` — синонимы → имена файлов (`Melee Weapon`→`MeleeWeapon`, `Armor`→`TypeArmor`).
*   `SPECIAL_LOGIC_ICON='Star'`, `START_LINE_KEYWORDS`, `ITEM_WORD_VARIANTS`.

## Основные функции
*   `create_icon_html(icon_name, title)` — генерирует `<picture>` с avif/webp source.
*   `get_alpha_id(num)` — числовой индекс → буквенный ID для временных плейсхолдеров иконок.
*   `replace_outside_spans(text, regex, handler)` — применяет regex только вне уже сформированных тегов (защита от порчи HTML).
*   `ParsedResult` (dataclass) — результат парсинга.
*   `parse_effect_details(text)` — разбор деталей эффекта.
*   `parse_text_with_icons(text)` — **ядро**: многошаговая подстановка иконок/подсветки (аналог TS-версии).
*   `generate_icons_or_text(words)` — рендер списка типов/тегов иконками или текстом.
*   `load_items_from_json(path)` / `parse_text_to_html(text)` — утилиты.
*   `save_parsed_data_to_db(item_name, parsed)` — запись результата в БД.
*   `parse_and_save_all_items(path?)` — пакетный прогон по всем предметам.
*   `test_json_parsing(path, limit)` — отладочный прогон на нескольких предметах.

## AI-контекст
*   **Критична синхронность с фронтом**: логика должна совпадать с [icon-parser.ts](../../../frontend/ground/utils/icon-parser.md), иначе превью и игра разойдутся. Тяжёлые regex — избегайте catastrophic backtracking.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
