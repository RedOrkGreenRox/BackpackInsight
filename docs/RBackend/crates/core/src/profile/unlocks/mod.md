# [core/profile/unlocks/mod.rs](/RBackend/crates/core/src/profile/unlocks/mod.rs)

## Назначение
Разбор строк разблокировок профиля (`Unlocks`) на косметику: скины героев и баннеры. Остальные разблокировки (квестовые награды и т. п.) игнорируются.

## Подмодули
- `banners` → `BannerService` — [banners](banners.md).
- `skins` → `SkinService` — [skins](skins.md).
- `types` → `BannerUnlock`, `SkinUnlock`, `UnlockName`, `Unlocks` — [types](types.md).

## `UnlockService::inspect(values)`
Для каждой строки пробует оба парсера и собирает `Unlocks`:
- скин добавляется в словарь `skins[владелец]` (порядок появления сохраняется);
- баннер — в список `banners`.

Пример: `NymphedoraSkin02`, `NymphedoraSkin03`, `Season01Banner01` → `skins = { Nymphedora: ["02", "03"] }`, `banners = ["Season01"]`.

## Связи
- Вызывается в [api/profile/view](../../../../api/src/profile/view.md); словарь скинов попадает во фронтенд как поле profile_skins (переключатель скинов в профиле). Обзор: [core_unlocks](../../../../core_unlocks.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
