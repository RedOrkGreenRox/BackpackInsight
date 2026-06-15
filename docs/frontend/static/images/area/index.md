# 🖼 Фоны зон (images/area/)

## Назначение
20 фоновых изображений зон/арен (`area01`…`area20`) в AVIF/WebP. Подставляются как фон шапки профиля в зависимости от прогресса игрока (трофеев).

## Структура
*   `avif/areaNN.avif`, `webp/areaNN.webp` (NN = 01…20).

## Связи (Dependencies)
*   Выбор зоны по трофеям: `_calculate_area` / `PROFILE_AREAS` в [ProfileFactory](../../../../backend/playerdata/services/ProfileFactory.md) и [data.py](../../../../backend/playerdata/data.md).
*   Подстановка фона: [header.ts](../../../ground/branches/profile/_profile/header/header.md), [Shell](../../../ground/roots/Shell.md).

## AI-контекст
*   Номер зоны (`01`…`20`) приходит из поля `Area` профиля. Диапазон фонов должен совпадать с длиной `PROFILE_AREAS`.

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок (полное покрытие сети документации).
