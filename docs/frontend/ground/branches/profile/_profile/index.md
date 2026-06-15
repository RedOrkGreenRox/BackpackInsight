# [Barrel модулей профиля (index.ts)](../../../../../../Frontend/Web/ground/branches/profile/_profile/index.ts)

## Назначение
Barrel-экспорт ветки профиля: типы, менеджеры, рендереры и контроллер сортировки. Экспортируется только то, что используется снаружи папки `_profile`.

## Связи (Dependencies)
*   Типы: [profile-types](utils/profile-types.md) (`Hero, Item, ProfileData, SavedState, RarityWeights`), [rarity-weights](utils/rarity-weights.md).
*   Менеджеры: [ProfileDataManager](managers/ProfileDataManager.md), [ProfileManager](managers/ProfileManager.md), [ProfileStateManager](managers/ProfileStateManager.md), [ProfileSkinsManager](managers/ProfileSkinsManager.md), [ProfileSortManager](managers/ProfileSortManager.md), [ScreenshotManager](managers/screenshot-manager.md).
*   Рендереры: [HeaderRenderer](header/header.md), [HeroesSectionRenderer](heroes/heroes-section.md), [HeroCardRenderer](heroes/hero-card.md), [ItemsSectionRenderer](items/items-section.md), [ItemCardRenderer](items/item-card.md).
*   [SortController](sort/SortController.md).

## AI-контекст
*   Используется [ProfileBranch](../ProfileBranch.md). Соблюдает инкапсуляцию: наружу торчит только публичный API ветки профиля.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
