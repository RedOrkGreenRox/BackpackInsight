# [Бинарный профиль (profile.rs)](/RBackend/crates/pack/src/profile.rs)

## Назначение
Запись и чтение FlatBuffer-представления профиля игрока (схема `profile.fbs`, идентификатор `"BIPR"`) — бинарный ответ `POST /api/profile.fb`.

## Типы
- `ProfileHeroPack` — герой: `name`, `level`, `rating`, `experience`, `exp_req`, `prestige`, `league`, `skin_num`.
- `ProfileItemPack` — предмет: `name`, `rarity`, `level`, `cards`, `cards_need` (`i32`, `-1` — улучшение невозможно).
- `ProfileViewPack` — весь профиль: никнейм, уровень, трофеи и бонусные трофеи, гемы, монеты, `xp_current`/`xp_need`, код области, `item_stats` (пары редкость → количество), `heroes`, `items`, необязательные `actual_version`/`install_version`, `profile_skins` (пары владелец → скины).
- `ProfileViewInfo` — короткая сводка: никнейм, число героев и предметов, уровень.

## API
- `build_profile_view_bytes(profile)` — строит буфер; счётчики `heroes_count`/`items_count` записываются из длины списков. Вспомогательные `build_item_stats`, `build_heroes`, `build_items`, `build_profile_skins` создают вложенные векторы.
- `read_profile_view_bytes(bytes)` — полный разбор обратно в `ProfileViewPack` (через `profile_view_from_fb`); отсутствующие строки и списки становятся пустыми.
- `read_profile_view_info_bytes(bytes)` — только сводка.

## Потребители
- Запись: [api/routes/profile_binary](../../api/src/routes/profile_binary.md) (данные готовит [api/profile/view](../../api/src/profile/view.md)).
- Чтение: [middleware/profile](../../middleware/src/profile.md); фронтенд — `decodeProfile` в [flatbuffer-decoders](../../../../Frontend/ground/middleware/flatbuffer-decoders.md).

## Тесты
`builds_and_reads_profile_view` — круговая запись/чтение.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
