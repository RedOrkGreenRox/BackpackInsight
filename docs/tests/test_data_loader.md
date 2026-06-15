# [Тесты загрузчика данных (test_data_loader.py)](../../tests/test_data_loader.py)

## Назначение
Тесты [data.py](../backend/playerdata/data.md): загрузка `items_*.json` и версионирование (выбор старшей версии файла).

## Покрытие
*   `get_items()` возвращает непустой dict; корректность структуры.

## AI-контекст
*   Рабочий тест. При добавлении нового `items_X_Y_Z.json` проверяет авто-выбор версии.
## Покрываемые тест-классы и кейсы
*   `TestItemsLoader`: `test_get_items_non_empty`, `test_known_items_present`, `test_get_craftable_ids`, `test_profile_exp_need_is_tuple`.
*   `TestVersionDetection`: `test_latest_items_file_exists`.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
