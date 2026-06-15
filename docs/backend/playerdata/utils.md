# [Утилиты PlayerData (utils.py)](../../../Backend/PlayerData/utils.py)

## Назначение
Вспомогательные функции для снижения дублирования в моделях: прокси-свойства к `ItemDefinition`, безопасный доступ к вложенным словарям и безопасное создание определения предмета.

## Связи (Dependencies)
*   Используется в [модели предмета (Item.py)](models/Item.md) (`definition_proxy_property`, `safe_get_nested`).

## Подробное описание
*   `definition_proxy_property(field_name, default=None)` — фабрика декораторов: создаёт `property`, которое читает поле из связанного `ItemDefinition` (через `self._get_definition()`), с дефолтом при отсутствии. Убирает копипаст прокси-геттеров в `Item`.
*   `safe_get_nested(data, keys, default=None)` — безопасный обход вложенных dict по списку ключей (пример: `['Data','UID']`).
*   `create_item_definition_safe(item_id, name, rarity='Common')` — валидирует непустые id/name и создаёт `ItemDefinition` (ленивый импорт во избежание циклов).

## AI-контекст
*   `definition_proxy_property` — ключ к паттерну «player Item проксирует статические поля из ItemDefinition». При добавлении нового проксируемого поля используйте этот декоратор, а не пишите геттер вручную.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
