# [Конфигурация pytest (pytest.ini)](../pytest.ini)

## Назначение
Корневой конфиг pytest: каталог тестов, шаблоны имён, опции вывода, фильтры предупреждений.

## Содержимое
*   `testpaths=tests`; `python_files=test_*.py`; `python_classes=Test*`; `python_functions=test_*`.
*   `addopts=-ra --tb=short`; игнор `DeprecationWarning`.

## Связи (Dependencies)
*   Тесты в [tests/](tests/test_models.md); запуск через [run_tests.py](scripts/run_tests.md).

## AI-контекст
*   Основной активный конфиг тестов. Есть ещё два частных `pytest.ini` ([scripts](scripts/pytest.md), [Backend/PlayerData](backend/playerdata/pytest.md)) — вспомогательные.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
