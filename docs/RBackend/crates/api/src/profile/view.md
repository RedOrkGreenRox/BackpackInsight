# [api/profile/view.rs](/RBackend/crates/api/src/profile/view.rs)

## Назначение
`profile_view(json, project_root, lang)` — полный разбор игрового профиля в `ProfileViewResponse`. Это ядро `POST /api/profile.fb`: результат кодируется в пак `"BIPR"` в [routes/profile_binary](../routes/profile_binary.md).

## Порядок разбора
1. `ProfileCheckService::check` ([core/check](../../../core/src/profile/check.md)); при проблемах — ошибка со всеми замечаниями.
2. `ProfileIdentityService::read` ([core/identity](../../../core/src/profile/identity/mod.md)) — ник; ошибка также прерывает разбор.
3. Кошелёк, счёт и арена, разблокировки — сервисы [wallet](../../../core/src/profile/wallet/mod.md), [score](../../../core/src/profile/score.md), [unlocks](../../../core/src/profile/unlocks/mod.md); входы готовит [json_input](json_input.md).
4. Герои — [heroes](heroes.md); предметы и их статистика — [items](items.md). Ошибка загрузки каталога превращается в ошибку ответа.
5. Уровень профиля — `LevelService::from_total_xp` от суммы опыта всех предметов ([core/level](../../../core/src/profile/level.md)); опыт героев в уровень не входит.

## Типы
- `ProfileViewResponse` — поля пака плюс `heroes_count`, `items_count` и `item_records` (для БД, по индексу совпадают с `items`). `actual_version` берётся из `Data.AV`, `install_version` — из верхнего `IV`, `profile_skins` — открытые скины по героям.
- `ProfileErrorResponse` — `detail` (начинается с «Failed to process profile») и `issues`.

## Помощники
`data_string(json, key)` — строка из объекта `Data`; `top_string(json, key)` — строка верхнего уровня.

## Тесты
- `builds_minimal_frontend_like_view` — профиль без предметов: уровень 1, 0 из 40 опыта, арена 14 при 5000 трофеев, скин Nymphedora `02`.
- `builds_items_and_profile_level_from_item_xp` — Wooden Sword даёт уровень 2 и 150 из 280 опыта (только при собранном паке).
- `invalid_shape_returns_error` — пустой объект даёт четыре замечания.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
