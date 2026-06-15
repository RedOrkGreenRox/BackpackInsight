# [Тесты моделей (test_models.py)](../../tests/test_models.py)

## Назначение
Юнит-тесты чистой логики моделей [Profile](../backend/playerdata/models/Profile.md)/[Hero](../backend/playerdata/models/Hero.md)/[Item](../backend/playerdata/models/Item.md)/`ItemDefinition` без HTTP.

## Покрытие
*   Парсинг героя (`from_entry`), уровни/престиж/лиги; прокси-свойства предмета; сериализация `to_frontend_view`.

## AI-контекст
*   Самый крупный юнит-набор (рабочий). Хороший ориентир ожидаемого поведения моделей.
## Покрываемые тест-классы и кейсы
*   `TestItemDefinitions`: `test_static_items_preloaded`, `test_known_item_exists`, `test_item_has_rarity`.
*   `TestHero`: `from_entry` (basic/prestige/league/empty/too_short), `test_unknown_hero_name_passes_through`, `exp_req` (below/above 20), `test_to_frontend_view_shape`.
*   `TestProfile`: creation/heroes/items_skip_unknown/to_frontend_view (shape/currency)/skins/banners/technical_info.
*   `TestItem`: level_offset/higher_level/proxy_name/to_frontend_view.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
