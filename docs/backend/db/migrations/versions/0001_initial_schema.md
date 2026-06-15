# [Миграция 0001: начальная схема (0001_initial_schema.py)](../../../../../Backend/DB/migrations/versions/0001_initial_schema.py)

## Назначение
Первая миграция Alembic: создаёт начальную схему БД — таблицы `itemdefinition`, `profile`, `hero`, `item` со всеми колонками и связями. Базовая ревизия (`down_revision = None`).

## Связи (Dependencies)
*   Схема выводится из моделей [ItemDefinition/Item](../../../playerdata/models/Item.md), [Profile](../../../playerdata/models/Profile.md), [Hero](../../../playerdata/models/Hero.md).
*   Запускается через [env.py](../env.md) (`alembic upgrade head`).

## Подробное описание
*   `revision='0001'`, `down_revision=None`.
*   `upgrade()` — `op.create_table(...)` для `itemdefinition` (item_id PK, name, rarity, coin_value, JSON-поля: item_types/item_shape/item_stars/recipes/combat_stats_data/all_stats_data/tooltips/levels_info, purchasable) и таблиц `profile`/`hero`/`item` с внешними ключами.
*   `downgrade()` — обратный `drop_table`.

## AI-контекст
*   Автогенерировано Alembic по метаданным SQLModel. При изменении моделей создавайте НОВУЮ ревизию (`alembic revision --autogenerate`), а не правьте эту. JSON-колонки — для гибких игровых данных.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
