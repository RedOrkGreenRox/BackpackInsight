# [Тесты утилит бэкенда (test_utils.py)](../../tests/test_utils.py)

## Назначение
Тесты хелперов [utils.py](../backend/playerdata/utils.md): `create_item_definition_safe`, `safe_get_nested`.

## Покрытие
*   Валидация пустых id/name; безопасный обход вложенных словарей.

## AI-контекст
*   Рабочий тест.
## Покрываемые тест-классы и кейсы
*   `TestSafeGetNested`: `test_simple/nested/missing_returns_default/partial_path_missing/non_dict_in_middle/empty_keys_returns_data`.
*   `TestCreateItemDefinitionSafe`: `test_basic/default_rarity/strips_whitespace/rejects_empty_id/rejects_whitespace_id/rejects_empty_name`.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
