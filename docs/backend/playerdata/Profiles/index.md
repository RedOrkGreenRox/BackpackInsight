# 📂 Профили-образцы (Profiles/)

## Назначение
Каталог реальных/демонстрационных экспортов профилей игроков **Backpack Brawl** в формате игрового лога (JSON). Используются для ручного тестирования парсинга и как примеры входных данных.

## Формат
*   Корень: `Data{}` (тех. поля AV/BN/GR/BT...), `Name`, `Currency{}`, `UL[]` (разблокировки), `Trophy`, `BonusTrophy`, `Hero{}`, `Item{}`, `UID` и т.д. (полный разбор — в [ProfileFactory](../services/ProfileFactory.md) и [constants.py](../constants.md)).

## Файлы
*   [DI4-new.json](DI4-new.md)
*   [DI4.json](DI4.md)
*   [German.json](German.md)
*   [Lotreomon.json](Lotreomon.md)
*   [Marat.json](Marat.md)
*   [Molodoy_Zhuk.json](Molodoy_Zhuk.md)
*   [Sky.json](Sky.md)
*   [Sky_of_BFG.json](Sky_of_BFG.md)
*   [Teger.json](Teger.md)
*   [hush.json](hush.md)
*   [merul.json](merul.md)
*   [rimaster.json](rimaster.md)
*   [xr1stos422.json](xr1stos422.md)

## Связи (Dependencies)
*   Парсятся [ProfileFactory](../services/ProfileFactory.md); структуру полей описывает [Profile](../models/Profile.md).

## Прочее
*   [__init__.py](__init__.md) — маркер пакета каталога.

## AI-контекст
*   Реальные дампы содержат тех. данные устройств игроков (PII-подобное) — обращаться аккуратно. Для unit-тестов есть синтетические [fixtures](../../../tests/fixtures/synthetic_profile_minimal.md).

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
