# [Эндпоинт бинарного профиля (profile_binary.rs)](/RBackend/crates/api/src/routes/profile_binary.rs)

## Назначение
`POST /api/profile.fb?lang=en|ru` — принимает игровой профиль в JSON, отвечает бинарным паком `"BIPR"`. Перед обработчиком стоят секрет, лимит частоты и лимит размера тела (см. [lib](../lib.md)).

## `profile_fb(state, query, payload)`
1. `ProfileLangQuery` — параметр `lang` (по умолчанию пустой), нормализуется `normalize_lang` ([profile/catalog_cache](../profile/catalog_cache.md)).
2. `profile_view` ([profile/view](../profile/view.md)) строит представление; ошибка — 400.
3. Пак строится `build_profile_view_bytes` ([pack/profile](../../../pack/src/profile.md)) из `to_pack(view)`.
4. `save_profile_if_enabled` сохраняет профиль; ошибка сохранения — 500, и пак клиенту не отдаётся.
5. Успех — 200, `content-type: application/octet-stream`, без заголовков кеширования.

Тело, которое не разбирается как JSON, отклоняет экстрактор Axum до обработчика — его ответ текстовый, а не пак ошибки.

## Внутреннее
- `save_profile_if_enabled` — без БД ничего не делает. Иначе получает uid через `ProfileIdentityService::read`, собирает `db::HeroSave` и `db::ItemSave` (предметы склеиваются с `item_records` по индексу) и вызывает `db::save_profile` ([db/profile](../../../db/src/profile.md)).
- `to_pack(view)` — переносит поля в `ProfileViewPack`; `item_records` и счётчики отбрасываются, `skin_num` становится `String`.
- `error_response(error)` — пак ошибки (`build_api_error_bytes`, [pack/error](../../../pack/src/error.md)) всегда с `code` = `bad_request`, в том числе при ошибке БД; итоговый статус задаёт кортеж в `profile_fb`.
- `binary_response(status, bytes)` — бинарный ответ.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
