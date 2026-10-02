# [Страница профиля (ProfileBranch.ts)](../../../../../Frontend/Web/ground/branches/profile/ProfileBranch.ts)

## Назначение
Сборка страницы `/profile` на [BranchSpec](../../roots/BranchSpec.md) + [BranchRunner](../../roots/BranchRunner.md). Файл описывает три модуля контракта [StructuredBranch](../../roots/StructuredBranch.md) и спецификацию; вся работа с данными делегирована [ProfileDataManager](_profile/managers/ProfileDataManager.md), отрисовка и события — [ProfileManager](_profile/managers/ProfileManager.md).

## Контекст `ProfileContext`
`profileData` (данные профиля, см. [profile-types](_profile/utils/profile-types.md)), `savedState` (сохранённое состояние страницы, см. [ProfileStateManager](_profile/managers/ProfileStateManager.md)) и `itemSort` (`'rarity' | 'level'`).

## Модули
- `ProfileDisplay`:
  - `renderSkeleton()` — скелетон из `ProfileDataManager.renderSkeleton()`;
  - `renderError(error)` — `h1.error` с текстом ошибки;
  - `renderFullPage()` — пустая обёртка `.profile-mount-wrapper`, которую затем наполняет `ProfileManager`.
- `ProfileDataLoader.load(input)` — `ProfileDataManager.resolve(input)` (данные из навигации или кеша); без данных бросает ошибку «Нет данных профиля» (её рисует `renderError`). Сортировка предметов: `profileData.itemsSort` → сохранённая `savedState.itemSort` → `rarity`; предметы сортируются через `sortItems`.
- `ProfileLogic` — `init()` создаёт `ProfileManager` с корнем, данными, сортировкой, сохранённым состоянием и `ProfileDataManager`, затем вызывает его `init()`; `destroy()` уничтожает менеджер.

## Экспорты
- `profileSpec` — `id: 'profile'`, `routes: ['/profile']`; `meta` берёт заголовок и описание из `ProfileDataManager.getMeta()` с запасными «Profile» / «Player Profile Details»; `logic` создаёт один `ProfileLogic`.
- `ProfileBranch` — класс страницы из `BranchRunner.createBranchClass()`; маршрут регистрирует [core.ts](../../core.md).

## Связи
- Стили страницы: [profile.scss](profile.md). Обзор модулей страницы: [индекс профиля](index.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
