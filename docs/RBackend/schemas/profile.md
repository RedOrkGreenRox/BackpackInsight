# [Схема ответа профиля (profile.fbs)](/RBackend/schemas/profile.fbs)

## Назначение
Схема ответа `POST /api/profile.fb` (пространство имён `BackpackInsight.Profile`, корень `ProfileView`, идентификатор `"BIPR"`): разобранный профиль игрока, готовый к показу.

## Таблицы
| Таблица | Поля |
| :--- | :--- |
| `ProfileView` | `nickname` (обязательное), `level`, `trophy`, `bonus_trophy`, `gems`, `coins`, `xp_current`, `xp_need`, `area`, `item_stats`, `heroes`, `heroes_count`, `items`, `items_count`, `actual_version`, `install_version`, `profile_skins` |
| `HeroView` | `name` (обязательное), `level`, `rating`, `experience`, `exp_req`, `prestige`, `league`, `skin_num` |
| `ItemView` | `name` (обязательное), `rarity`, `level`, `cards`, `cards_need` (знаковое: `-1` — максимальный уровень) |
| `ItemStat` | `rarity`, `count` — число предметов редкости |
| `SkinList` | `owner`, `skins` — открытые скины героя |

Счётчики `heroes_count` и `items_count` при записи считаются по длине списков ([pack/profile](../crates/pack/src/profile.md)).

## Кто пишет и читает
- Запись: [routes/profile_binary](../crates/api/src/routes/profile_binary.md) из [profile/view](../crates/api/src/profile/view.md).
- Чтение: [middleware/profile](../crates/middleware/src/profile.md); в браузере — [flatbuffer-decoders](../../Frontend/ground/middleware/flatbuffer-decoders.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
