# 🖼 Иконки интерфейса профиля (images/profile/)

## Назначение
UI-иконки страницы профиля: валюты (coins, gems...), лиги (bronze/diamond...), карточки редкости (cardcommon…cardrelic), а также служебные (default, dev, battles и т.п.). ~69 имён × 2 формата.

## Структура
*   `avif/<name>.avif`, `webp/<name>.webp`.

## Связи (Dependencies)
*   Самая используемая в коде папка изображений. Потребители: [header.ts](../../../ground/branches/profile/_profile/header/header.md), [stats-bar.ts](../../../ground/branches/profile/_profile/header/stats-bar.md), [hero-card.ts](../../../ground/branches/profile/_profile/heroes/hero-card.md), [heroes-section.ts](../../../ground/branches/profile/_profile/heroes/heroes-section.md), [SortController](../../../ground/branches/profile/_profile/sort/SortController.md).

## AI-контекст
*   Имена карт редкости (`card<rarity>`) и лиг согласованы с моделью данных ([core/profile/heroes/league.rs](../../../../RBackend/crates/core/src/profile/heroes/league.md), `ItemRarity` в [core/profile/items/types.rs](../../../../RBackend/crates/core/src/profile/items/types.md)).

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок (полное покрытие сети документации).
