# [Тесты целостности БД (test_db_integration.py)](../../tests/test_db_integration.py)

## Назначение
Проверка отношений и целостности данных в БД (профиль↔предметы↔герои).

## Связи (Dependencies)
*   Модели [Profile/Item/ItemDefinition/Hero](../backend/playerdata/models/Profile.md), [ProfileFactory](../backend/playerdata/services/ProfileFactory.md), фикстуры [conftest](conftest.md).

## Покрытие
*   Корректная привязка предметов/героев к профилю; внешние ключи.

## AI-контекст
*   Рабочий тест. Использует `profile_json_minimal`.
## Покрываемые кейсы
*   `test_profile_item_relationship` — предметы привязаны к профилю.
*   `test_item_definition_sharing` — `ItemDefinition` общий для разных `Item`.
*   `test_hero_profile_link` — связь героя с профилем.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
