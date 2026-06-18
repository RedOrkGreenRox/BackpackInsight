# [Тесты фабрики профилей (test_profile_factory.py)](../../tests/test_profile_factory.py)

## Назначение
Тесты [ProfileFactory](../Backend/PlayerData/services/ProfileFactory.md): парсинг JSON, валидация, кеш определений предметов.

## Покрытие
*   Валидация обязательных полей; создание профиля; статистика по редкости; поведение кеша (hit/miss).

## AI-контекст
*   Рабочий тест. Проверяет в т.ч. вычисление уровня/опыта/зоны.
## Покрываемые тест-классы и кейсы
*   `TestValidation`: отказы (non_dict/missing_data/no_hero_no_item/no_uid/no_nickname/empty_nickname), `test_accepts_valid_minimal`.
*   `TestCreateProfile`: `test_smoke`, `test_currency_extracted`, `test_trophies_include_bonus`, `test_app_version`.
*   `TestCache`: `test_clear_resets_stats`, `test_statistics_hit_rate`, `test_preload_populates_cache`.
*   `TestUnlockableParsing`: `test_skin_pattern/ignores_garbage`, `test_banner_pattern`, `test_combined_unlockables`.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
