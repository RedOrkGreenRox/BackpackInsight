# [Запуск тестов (run_tests.py)](../../scripts/run_tests.py)

## Назначение
Удобный раннер pytest из любого места проекта: переключает CWD в корень и запускает `tests/`.

## Подробное описание
*   `os.chdir(project_root)` + добавление корня в `sys.path`.
*   `pytest.main(["-v", "tests/", *argv])` — прокидывает доп. аргументы (например, `-k models`).

## Связи (Dependencies)
*   Конфиг pytest — [pytest.ini (корень)](../pytest.md). Тесты — в [tests/](../tests/test_models.md).

## AI-контекст
*   Учтите: сейчас в наборе есть два неработающих теста ([test_backend](../tests/test_backend.md), [test_profiles_integration](../tests/test_profiles_integration.md)) — они падают на сборе. Запуск всего набора без их исправления/исключения завершится ошибкой коллекции.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
