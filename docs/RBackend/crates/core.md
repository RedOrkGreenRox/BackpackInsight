# core — корень доменных правил

`core` — первый Rust crate будущего oracle-слоя.

Важно: `core` — **не склад всех переменных проекта**. В нём живут только чистые, переиспользуемые, проверяемые правила, которые должны быть единым источником истины для backend, SSR, islands, CLI и будущих FlatBuffers.

Что **можно** класть в `core`:

```text
slug rules
image-key rules
XP / level / area math
hero normalize / prestige / league math
item leveling math
search DSL parser/matcher
safe HTML rules
profile validation/analysis as pure logic
```

Что **нельзя** класть в `core`:

```text
HTTP/Axum routes
SQLx queries
PostgreSQL repositories
Leptos DOM/browser code
Cloudflare/CDN config
Docker/deploy logic
large runtime state
manual caches
```

Главное правило: **никаких монолитов**. Каждый доменный кусок лежит в своём маленьком модуле:

```text
slug.rs                         SlugService, ItemName, Slug
image_key.rs                    ItemIconService, ImageKey
catalog/ids.rs                   ItemId, HeroId, StringId
catalog/strings.rs               StringPool
catalog/columns.rs               CatalogColumns
profile/types.rs                Xp, PlayerLevel, PlayerArea, LevelProgress
profile/check.rs                ProfileCheckService
profile/identity/types.rs       ProfileUid, ProfileName, ProfileIdentity
profile/identity/uid.rs         ProfileUidService
profile/identity/name.rs        ProfileNameService
profile/wallet/types.rs         Coins, Gems, ProfileWallet
profile/wallet/read.rs          ProfileWalletService
profile/score.rs               Trophy, BonusTrophy, ProfileScoreService
profile/level.rs                LevelService
profile/area.rs                 AreaService
profile/heroes/types.rs         Hero, HeroInput, HeroName, HeroLevel, HeroRating
profile/heroes/name.rs          HeroNameService
profile/heroes/level.rs         HeroLevelService
profile/heroes/league.rs        LeagueService
profile/items/types.rs          ItemRarity, ItemLevel, Cards, ItemLevelInfo
profile/items/rarity.rs         RarityService
profile/items/cards.rs          CardsService
profile/items/xp.rs             ItemXpService
profile/unlocks/types.rs        UnlockName, SkinUnlock, BannerUnlock, Unlocks
profile/unlocks/skins.rs        SkinService
profile/unlocks/banners.rs      BannerService
```

На текущей контрольной точке реализовано:

- `ItemName` — доменный тип имени предмета;
- `Slug` — доменный тип slug;
- `SlugService` — единая функция генерации slug;
- `ImageKey` — доменный тип ключа картинки предмета;
- `ItemIconService` — единая функция выбора картинки предмета;
- `Xp` — доменный тип опыта;
- `PlayerLevel` — доменный тип уровня;
- `PlayerArea` — доменный тип area-code;
- `LevelService` — расчёт уровня/current/need по total XP;
- `AreaService` — расчёт area-code по trophy + bonus trophy;
- `HeroNameService` — нормализация внутренних имён героев;
- `HeroLevelService` — 0-based raw level, prestige и exp requirement;
- `LeagueService` — лига по рейтингу;
- `HeroService` — сборка доменного `Hero` из входных значений;
- `ItemRarity` — доменный enum редкости предмета;
- `ItemLevel` — доменный тип уровня предмета;
- `Cards` — доменный тип карт предмета;
- `CardsService` — расчёт cards_need/upgradable;
- `ItemXpService` — расчёт total_xp предмета;
- `ItemLevelService` — тонкая сборка cards/xp/upgradable;
- `SkinService` — разбор `{owner}Skin{skin}`;
- `BannerService` — разбор `{name}Banner...`;
- `UnlockService` — тонкая сборка skins/banners из UL-списка;
- `ProfileCheckService` — базовая проверка формы профиля без чтения JSON внутри `core`;
- `ProfileUidService` — выбор UID с приоритетом `Data.UID`;
- `ProfileNameService` — чтение непустого имени профиля;
- `ProfileIdentityService` — тонкая сборка UID + Name;
- `ProfileWalletService` — чтение coins + gems с default 0;
- `ProfileScoreService` — чтение trophy/bonus/total/area одним маленьким связанным модулем;
- `ItemId`, `HeroId`, `StringId` — компактные typed IDs для будущего DOD-каталога;
- `StringPool` — минимальное интернирование строк;
- `CatalogColumns` — первый DOD-скелет каталога на typed IDs и StringPool.

Назначение:

```text
не держать slug, item-image, XP/level/area/hero/item-level/unlock logic отдельно во frontend, backend и scripts,
а иметь один проверяемый Rust-источник истины.
```

Публичные имена:

```text
SlugService
ItemIconService
LevelService
AreaService
HeroService
ItemLevelService
CardsService
ItemXpService
RarityService
SkinService
BannerService
UnlockService
ProfileCheckService
ProfileIdentityService
ProfileUidService
ProfileNameService
ProfileWalletService
ProfileScoreService
ItemId
HeroId
StringId
StringPool
CatalogColumns
```

---
> 📌 **Подпись документации:** описание `core` после двенадцатой контрольной точки, 2026-07-06.
