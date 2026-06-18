# [Синтетический профиль (минимальный) (synthetic_profile_minimal.json)](../../../tests/fixtures/synthetic_profile_minimal.json)

## Назначение
Минимальный искусственный профиль для unit-тестов: только обязательные поля (Data.AV, Name, Currency, Trophy, UID...). Без PII реальных игроков.

## Связи (Dependencies)
*   Подаётся фикстурой `profile_json_minimal` из [conftest.py](../conftest.md) в тесты [test_db_integration](../test_db_integration.md) и др.

## AI-контекст
*   Синтетика безопаснее реальных [профилей-образцов](../../Backend/PlayerData/Profiles/index.md) для CI. Минимальный набор полей проверяет «счастливый путь» парсинга.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
