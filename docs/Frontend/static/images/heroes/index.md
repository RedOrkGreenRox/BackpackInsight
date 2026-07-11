# 🖼 Портреты и скины героев (images/heroes/)

## Назначение
Изображения героев и их скинов. На каждого героя — отдельная папка с файлами вида `<hero>NN` (например, `harkon01`, `harkon02` — базовый и скины), в форматах AVIF/WebP.

## Структура
*   `<hero>/avif/<hero>NN.avif`, `<hero>/webp/<hero>NN.webp`.
*   Герои: buzz, celeste, chana, dorf, enoch, fern, harkon, hob, kragg, morrow, nymphedora, pepper, ronan, sage, tink, zahir.
*   Утилита подготовки/конвертации этих ассетов — [convert.ps1](convert.md).

## Связи (Dependencies)
*   Отрисовка карточек героев: [hero-card.ts](../../../ground/branches/profile/_profile/heroes/hero-card.md), шапка профиля [header.ts](../../../ground/branches/profile/_profile/header/header.md).
*   Переключение скинов: [ProfileSkinsManager](../../../ground/branches/profile/_profile/managers/ProfileSkinsManager.md).
*   Тех. имена героев → игровые сопоставляет `VALUES` в [data.py](../../../../Backend/PlayerData/data.md).

## AI-контекст
*   Суффикс `NN` — номер скина (`01` базовый). Логика выбора/перебора скинов завязана на это именование; см. также стили [_image.scss](../../../ground/branches/profile/_profile/main-heroes-grid/_image.md).

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок (полное покрытие сети документации).
