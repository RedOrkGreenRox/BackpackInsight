# [db/profile.rs](/RBackend/crates/db/src/profile.rs)

## Назначение
`save_profile(pool, profile)` — сохранение профиля в нормализованные таблицы `profiles`, `hero` и `item` в одной транзакции. SQL общий для Postgres и SQLite: плейсхолдеры `$N`, `ON CONFLICT ... DO UPDATE ... RETURNING id`, многострочный `INSERT`.

## Типы
- `ProfileSave` — `uid`, `nickname`, `level`, `trophy`, `bonus_trophy`, `coins`, `gems`, `area`, а также списки `heroes` и `items`. Числа без знака пишутся как `i64`.
- `HeroSave` — `name`, `level`, `experience`, `rating`, `prestige`, `league`, `exp_req`.
- `ItemSave` — `item_id`, `level`, `cards`, `cards_need`, `total_xp`.
- `SavedProfile` — `uid` и `nickname` сохранённого профиля.

## Шаги транзакции
1. Вставка или обновление строки `profiles` по `uid` с `updated_at = CURRENT_TIMESTAMP`; возвращается `id`.
2. Все герои профиля удаляются и вставляются заново одним запросом (8 колонок на строку).
3. Так же для предметов (6 колонок).
4. Коммит. Любая ошибка возвращается строкой с названием шага, транзакция откатывается.

`build_bulk_insert(prefix, rows, cols)` — дописывает к префиксу группы плейсхолдеров `($1, …)`, нумеруя их подряд.

## Тесты
`build_bulk_insert_2_rows_3_cols` и `build_bulk_insert_single_row` проверяют SQL. `profile_save_carries_heroes_and_items_not_blob`, `profile_save_with_empty_children_is_valid` и `hero_save_preserves_prestige_flag` только собирают структуры и читают их поля, к БД не обращаются.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
