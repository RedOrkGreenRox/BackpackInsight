# core unlocks — косметика профиля без монолита

`core` разбирает unlock-строки профиля маленькими модулями, а не через большой old Python profile parser.

Структура:

```text
profile/unlocks/types.rs     UnlockName, SkinUnlock, BannerUnlock, Unlocks
profile/unlocks/skins.rs     SkinService
profile/unlocks/banners.rs   BannerService
profile/unlocks/mod.rs       UnlockService как тонкая сборка
```

На текущей контрольной точке реализуется:

```text
NymphedoraSkin02  -> skin owner=Nymphedora skin=02
WarriorSkinGold   -> skin owner=Warrior skin=Gold
Season01Banner01  -> banner name=Season01
birthdayBanner01  -> banner name=birthday
```

Важно: это исправляет известный backend-регресс. В текущем Python old Python profile parser regex для skins разрешает только буквы после `Skin`, поэтому `Skin02` может не распознаться. В `core` skin suffix допускает цифры.

---
> 📌 **Подпись документации:** unlock-логика `core`, 2026-07-06.
