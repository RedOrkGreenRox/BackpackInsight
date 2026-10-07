# [Консольная утилита проверки ядра (main.rs)](/Backend/crates/cli/src/main.rs)

## Назначение
Консольная утилита для ручной проверки сервисов crate core: каждая команда вызывает один сервис и печатает результат строкой `ключ=значение`. Используется как «оракул» при сверке с поведением старого Python-бэкенда; сервер её не использует. Запуск — `cargo run -p cli -- <команда>`.

## Команды
| Команда | Сервис core | Документ |
| :--- | :--- | :--- |
| `slug <имя>` | `SlugService::to_slug` | [slug](../../core/src/slug.md) |
| `image-key [--rarity R] [--tooltip T] <имя>` | `ItemIconService::image_key` | [image_key](../../core/src/image_key.md) |
| `level --xp N` | `LevelService::from_total_xp` | [level](../../core/src/profile/level.md) |
| `area --trophy N [--bonus N]` | `AreaService::from_trophies` | [area](../../core/src/profile/area.md) |
| `hero --name --level-raw --xp --rating` | `HeroService::read` | [heroes](../../core/src/profile/heroes/mod.md) |
| `item-level --rarity R --level L [--cards C]` | `ItemLevelService::inspect` | [items](../../core/src/profile/items/mod.md) |
| `unlock --value U` или `--file профиль` | `SkinService`, `BannerService`, `UnlockService` | [unlocks](../../core/src/profile/unlocks/mod.md) |
| `profile-check --file` | `ProfileCheckService::check` | [check](../../core/src/profile/check.md) |
| `profile-id --file` | `ProfileIdentityService::read` | [identity](../../core/src/profile/identity/mod.md) |
| `profile-wallet --file` | `ProfileWalletService::read` | [wallet](../../core/src/profile/wallet/mod.md) |
| `profile-score --file` | `ProfileScoreService::read` | [score](../../core/src/profile/score.md) |
| `intern <строки…>` | `StringPool` | [strings](../../core/src/catalog/strings.md) |
| `catalog-summary [--items-file P]` | `CatalogColumns` | [columns](../../core/src/catalog/columns.md) |
| `check-images [--items-file P] [--web-root P]` | `ItemIconService` | [image_key](../../core/src/image_key.md) |

Без аргументов — справка (`print_help`) и код 2; ошибка — сообщение в stderr и код 1. `profile-check` и `profile-id` при невалидном профиле печатают замечания и тоже завершаются с кодом 1.

## Обработчики
Каждой команде соответствует функция `command_<имя>`: `command_slug`, `command_image_key`, `command_level`, `command_area`, `command_hero`, `command_item_level`, `command_unlock`, `command_profile_check`, `command_profile_id`, `command_profile_wallet`, `command_profile_score`, `command_intern`, `command_catalog_summary`, `command_check_images`. Флаги разбираются вручную в цикле; неизвестный флаг — ошибка.

- `command_unlock` со строкой проверяет её и как скин, и как баннер; с файлом — считает скины по героям и баннеры из массива `UL`.
- `command_catalog_summary` собирает колонки каталога, пропуская предметы без id, имени или с нераспознанной редкостью, и печатает первый предмет.
- `command_check_images` проверяет webp и avif только по ключу от имени, без запасного ключа от id, который есть в [builder/images](../../builder/src/catalog/images.md).

## Помощники
- `parse_u32`, `parse_u64` — значение флага с сообщением об ошибке.
- `single_file_arg` — разбор единственного флага `--file`; `read_json_file` — чтение JSON.
- `profile_identity_input_from_json`, `profile_wallet_input_from_json`, `profile_score_input_from_json` — те же извлечения полей, что [api/profile/json_input](../../api/src/profile/json_input.md); `profile-check` собирает вход прямо в обработчике.
- `items_array` — массив предметов из JSON.
- Корень проекта ищет [core::find_project_root](../../core/src/project_root.md).
- `latest_plain_items_file`, `plain_items_version` — копии функций из [builder/catalog/files](../../builder/src/catalog/files.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
