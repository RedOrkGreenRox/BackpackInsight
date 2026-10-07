# [Корень ядра (lib.rs)](/Backend/crates/core/src/lib.rs)

## Назначение
Корень библиотечного crate ядра (имя пакета в `Cargo.toml` — backend_core, зависимости — `unicode-normalization`, `serde`, `serde_json`). Собирает доменные правила BackpackInsight: slug-и, ключи картинок, строгую модель экспорта каталога, колонки каталога и правила профиля. Остальные crates подключают его и используют пути вида `backend_core::SlugService`.

## Модули
- `catalog` — строгая модель экспорта игры, типизированные id, интернирование строк, колоночное хранилище: [catalog/mod](catalog/mod.md).
- `image_key` — выбор картинки предмета: [image_key](image_key.md).
- `profile` — правила профиля игрока (уровни, герои, предметы, кошелёк, разблокировки, проверка): [profile/mod](profile/mod.md).
- `project_root` — поиск корня репозитория по `Backend/Cargo.toml`: [project_root](project_root.md).
- `slug` — нормализация имён в slug: [slug](slug.md).

Все модули приватные; наружу выходят только реэкспорты.

## Публичные реэкспорты
- Каталог: `CatalogExport`, `ExportError`, `ItemDef`, `Cell`, `Recipe`, `CombatStats`, `Levels`, `LevelChange` ([catalog/export](catalog/export/mod.md)), `CatalogColumns`, `CatalogItemInput`, `HeroId`, `ItemId`, `StringId`, `StringPool`.
- Картинки и slug: `ImageKey`, `ItemIconService`, `ItemName`, `Slug`, `SlugService`.
- Корень проекта: `find_project_root`, `find_project_root_from`, `PROJECT_ROOT_MARKER`.
- Профиль: сервисы (`AreaService`, `BannerService`, `CardsService`, `HeroService`, `HeroLevelService`, `HeroNameService`, `ItemLevelService`, `ItemXpService`, `LeagueService`, `LevelService`, `ProfileCheckService`, `ProfileIdentityService`, `ProfileNameService`, `ProfileScoreService`, `ProfileUidService`, `ProfileWalletService`, `RarityService`, `SkinService`, `UnlockService`) и доменные типы (`Hero`, `HeroInput`, `HeroLeague`, `HeroLevel`, `HeroName`, `HeroRating`, `ItemLevel`, `ItemLevelInfo`, `ItemRarity`, `Cards`, `Xp`, `PlayerArea`, `PlayerLevel`, `LevelProgress`, `ProfileIdentity*`, `ProfileName`, `ProfileUid`, `ProfileScore*`, `ProfileWallet*`, `Coins`, `Gems`, `Trophy`, `BonusTrophy`, `Unlocks`, `UnlockName`, `BannerUnlock`, `SkinUnlock`, `ProfileCheck*`, `ProfileIssue`). Подробности — в документах подмодулей.

## Связи
- Обзор crate: [core.md](../../core.md).
- Потребители: [api](../../api.md), [builder](../../build.md), [cli](../../cli.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
