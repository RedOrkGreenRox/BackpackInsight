# core items — маленькие корни предметной математики

`core` не создаёт монолитный `Item`-god-object. Предметная математика разделена на маленькие модули:

```text
profile/items/types.rs     ItemRarity, ItemLevel, Cards, ItemLevelInfo
profile/items/rarity.rs    RarityService
profile/items/cards.rs     CardsService
profile/items/xp.rs        ItemXpService
profile/items/mod.rs       ItemLevelService как тонкая сборка
```

На текущей контрольной точке реализована только чистая математика текущего backend:

```text
rarity + level -> cards_need
rarity + level -> total_xp
cards + cards_need -> upgradable
```

Это совместимый перенос логики из текущего `Backend/PlayerData/models/Item.py`, но без переноса старого монолитного стиля.

Важно: это compatibility layer. Когда игра будет декомпозирована полностью, таблицы и формулы можно будет заменить настоящими игровыми правилами через тот же маленький корень.

---
> 📌 **Подпись документации:** предметная математика `core`, 2026-07-06.
