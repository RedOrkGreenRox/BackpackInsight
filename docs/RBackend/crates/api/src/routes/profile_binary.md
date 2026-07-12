# [api/routes/profile_binary.rs](/RBackend/crates/api/src/routes/profile_binary.rs)

## Назначение
Главный ingestion-эндпоинт: `POST /api/profile.fb`. Принимает сырой игровой JSON, строит `ProfileViewResponse`, упаковывает в FlatBuffer `BIPR`, опционально сохраняет в БД.

## Ключевая функциональность
- `profile_fb(State, body)` — Axum-хендлер.
- `normalize_lang` — парсит `?lang=en|ru`.
- `save_profile_if_enabled(state, view)` — вызывает `db::save_profile` (транзакция: upsert profiles → DELETE hero/item → bulk INSERT heroes+items). См. SQL-1 worklog.
- Возвращает FlatBuffer `BIPR` или `BIER` (ошибка).

## Связи
- Сборка: [profile/view.rs](../profile/view.md).
- Сохранение: [db/src/profile.rs](/docs/RBackend/crates/db.md).
- Защита: [security/rate_limit.rs](../security/rate_limit.md) + [security/secret.rs](../security/secret.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
