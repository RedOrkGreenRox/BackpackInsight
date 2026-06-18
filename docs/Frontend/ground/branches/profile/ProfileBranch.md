# [Страница профиля (ProfileBranch.ts)](../../../../../Frontend/Web/ground/branches/profile/ProfileBranch.ts)

## Назначение
Бранч страницы профиля игрока. Наследуется от [Branch](../../roots/Branch.md): резолвит данные профиля, сортирует предметы, рендерит скелетон и передаёт управление оркестратору.

## Связи (Dependencies)
*   [Базовый Бранч](../../roots/Branch.md) (`extends Branch`).
*   [Менеджер данных профиля (ProfileDataManager)](_profile/managers/ProfileDataManager.md): `getMeta`, `resolve`, `restoreSavedState`, `sortItems`, `renderSkeleton`.
*   [Оркестратор профиля (ProfileManager)](_profile/managers/ProfileManager.md): основная отрисовка/интерактив.
*   Стили: [profile.scss](profile.md).
*   Изображения шапки: [фоны арен](../../../static/images/area/index.md), [иконки профиля](../../../static/images/profile/index.md).

## Подробное описание методов
*   `getMeta(data)` — делегирует `dataManager.getMeta`.
*   `getHtml(data)` — резолвит данные; при отсутствии показывает ошибку; сортирует предметы (по `itemsSort`/сохранённому состоянию, дефолт `rarity`); кладёт `_pending` для `init()`; возвращает скелетон.
*   `init()` — забирает `_pending` и инициализирует [ProfileManager](_profile/managers/ProfileManager.md).

## AI-контекст
*   Разделение ответственности: данные/сортировка — в [ProfileDataManager](_profile/managers/ProfileDataManager.md), отрисовка/события — в [ProfileManager](_profile/managers/ProfileManager.md). Передача состояния через `(this as any)._pending` — мостик между `getHtml()` и `init()` в рамках жизненного цикла Branch.

---

> 📌 **Подпись документации:** актуализировано при аудите (полнота, точность, ссылки).
