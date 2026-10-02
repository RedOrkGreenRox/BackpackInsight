# [core/lib.rs](/RBackend/crates/core/src/lib.rs)

## Назначение
Корень библиотечного crate ядра (имя пакета в `Cargo.toml` — rbackend_core, зависимость — только `unicode-normalization`). Собирает доменные правила BackpackInsight: slug-и, ключи картинок, колонки каталога и правила профиля. Остальные crates подключают его и используют пути вида `rbackend_core::SlugService`.

## Модули
- `catalog` — типизированные id, интернирование строк, колоночное хранилище: [catalog/mod](catalog/mod.md).
- `image_key` — выбор картинки предмета: [image_key](image_key.md).
- `profile` — правила профиля игрока (уровни, герои, предметы, кошелёк, разблокировки, проверка): [profile/mod](profile/mod.md).
- `slug` — нормализация имён в slug: [slug](slug.md).

Все модули приватные; наружу выходят только реэкспорты.

## Публичные реэкспорты
- Каталог: `CatalogColumns`, `CatalogItemInput`, `HeroId`, `ItemId`, `StringId`, `StringPool`.
- Картинки и slug: `ImageKey`, `ItemIconService`, `ItemName`, `Slug`, `SlugService`.
- Профиль: сервисы (`AreaService`, `BannerService`, `CardsService`, `HeroService`, `HeroLevelService`, `HeroNameService`, `ItemLevelService`, `ItemXpService`, `LeagueService`, `LevelService`, `ProfileCheckService`, `ProfileIdentityService`, `ProfileNameService`, `ProfileScoreService`, `ProfileUidService`, `ProfileWalletService`, `RarityService`, `SkinService`, `UnlockService`) и доменные типы (`Hero`, `HeroInput`, `HeroLeague`, `HeroLevel`, `HeroName`, `HeroRating`, `ItemLevel`, `ItemLevelInfo`, `ItemRarity`, `Cards`, `Xp`, `PlayerArea`, `PlayerLevel`, `LevelProgress`, `ProfileIdentity*`, `ProfileName`, `ProfileUid`, `ProfileScore*`, `ProfileWallet*`, `Coins`, `Gems`, `Trophy`, `BonusTrophy`, `Unlocks`, `UnlockName`, `BannerUnlock`, `SkinUnlock`, `ProfileCheck*`, `ProfileIssue`). Подробности — в документах подмодулей.

## Связи
- Обзор crate: [core.md](../../core.md).
- Потребители: [api](../../api.md), [builder](../../build.md), [cli](../../cli.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
