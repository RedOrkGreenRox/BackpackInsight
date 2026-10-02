# [Страница профиля (ProfileBranch.ts)](/Frontend/Web/ground/branches/profile/ProfileBranch.ts)

## Назначение
Точка входа раздела «Профиль»: аналитика прогресса, героев и инвентаря одного игрока. Устройство самой страницы (`profileSpec`, `ProfileDisplay`, `ProfileDataLoader`, `ProfileLogic`) описано в [ProfileBranch](ProfileBranch.md); здесь — карта модулей.

## Поток данных
1. Главная страница загружает JSON профиля и переходит на `/profile` с данными ([MainBranch](../main/MainBranch.md)).
2. `ProfileDataLoader` получает данные через [ProfileDataManager](_profile/managers/ProfileDataManager.md) (из навигации или кеша — [profileCacheUtils](../../roots/profileCacheUtils.md)); `ProfileDisplay` рисует скелетон (`renderSkeleton`), обёртку (`renderFullPage`) или ошибку (`renderError`).
3. `ProfileLogic` запускает [ProfileManager](_profile/managers/ProfileManager.md), который рендерит разметку и подключает поведение.

## Модули `_profile/`
- **Оркестрация и состояние**: [ProfileManager](_profile/managers/ProfileManager.md), [ProfileDataManager](_profile/managers/ProfileDataManager.md), [ProfileStateManager](_profile/managers/ProfileStateManager.md), [ProfileSortManager](_profile/managers/ProfileSortManager.md), [ProfileSkinsManager](_profile/managers/ProfileSkinsManager.md), [screenshot-manager](_profile/managers/screenshot-manager.md).
- **Разметка**: [ProfileLayoutRenderer](_profile/components/ProfileLayoutRenderer.md), шапка — [header](_profile/header/header.md), [player-info](_profile/header/player-info.md), [stats-bar](_profile/header/stats-bar.md); герои — [heroes-section](_profile/heroes/heroes-section.md), [hero-card](_profile/heroes/hero-card.md); предметы — [items-section](_profile/items/items-section.md), [item-card](_profile/items/item-card.md).
- **Сортировка**: [SortController](_profile/sort/SortController.md), [rarity-weights](_profile/utils/rarity-weights.md).
- **Типы**: [profile-types](_profile/utils/profile-types.md). Индекс экспорта: [_profile/index](_profile/index.md).
- **Стили**: [profile.scss](profile.md) и партиалы шапки, сетки героев, кнопок сортировки и сохранения.

## Особенности
- Скриншот шапки делает `html-to-image` ([screenshot-manager](_profile/managers/screenshot-manager.md)).
- Состояние страницы (сортировки, скролл) сохраняется в sessionStorage и localStorage через [ProfileStateManager](_profile/managers/ProfileStateManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
