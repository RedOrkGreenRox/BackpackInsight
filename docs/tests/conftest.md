# [Инфраструктура тестов (conftest.py)](../../tests/conftest.py)

## Назначение
Общие фикстуры pytest: даёт каждому тесту свежую in-memory SQLite БД с предзагруженными статическими предметами (`ItemDefinition`) из `items_*.json`.

## Связи (Dependencies)
*   [data.py](../backend/playerdata/data.md), [ProfileFactory](../backend/playerdata/services/ProfileFactory.md), модели [Profile/Item/Hero](../backend/playerdata/models/Profile.md).
*   Фикстуры профилей читают `tests/fixtures/*.json`.

## Подробное описание
*   Настраивает `sys.path`, форсирует SQLite-движок (in-memory) на тест.
*   Фикстура `session` — сессия БД с загруженными определениями.
*   Фикстуры образцов: [synthetic_profile_minimal.json](fixtures/synthetic_profile_minimal.md) (`profile_json_minimal`) и [synthetic_profile_full.json](fixtures/synthetic_profile_full.md) (`profile_json_full`).

## AI-контекст
*   Изоляция тестов строится на свежей in-memory БД на каждый тест. Если добавляете тест, требующий статических предметов — используйте фикстуру `session`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
