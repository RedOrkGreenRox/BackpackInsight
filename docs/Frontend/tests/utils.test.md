# [Тесты утилит (utils.test.ts)](../../../Frontend/Web/tests/utils.test.ts)

## Назначение
Vitest-тесты ключевых утилит: [icon-parser](../ground/utils/icon-parser.md) (`parseTextWithIcons`, `generateIconsOrText`) и [ApiService](../ground/utils/ApiService.md).

## Покрытие
*   Парсер: замена ключевых слов на иконки, алиасы (`Melee Weapon`→`MeleeWeapon`), подсветка значений.
*   ApiService: поведение запросов/обработки ошибок.

## AI-контекст
*   Тест парсера — важный страж синхронности с бэкендовым [icon_parser.py](../../Backend/PlayerData/builds/icon_parser.md). Импорты актуальны.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
