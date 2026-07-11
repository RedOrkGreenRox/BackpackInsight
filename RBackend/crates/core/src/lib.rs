//! core — общий корень доменных правил BackpackInsight.
//!
//! Публичные имена намеренно сохраняют язык текущей архитектуры:
//! `SlugService`, `ItemIconService`, `LevelService`, `AreaService`, `HeroService`.

mod catalog;
mod image_key;
mod profile;
mod slug;

pub use catalog::{CatalogColumns, CatalogItemInput, HeroId, ItemId, StringId, StringPool};
pub use image_key::{ImageKey, ItemIconService};
pub use profile::{
    AreaService, BannerService, BannerUnlock, BonusTrophy, Cards, CardsService, Coins, Gems, Hero,
    HeroInput, HeroLeague, HeroLevel, HeroLevelService, HeroName, HeroNameService, HeroRating,
    HeroService, ItemLevel, ItemLevelInfo, ItemLevelService, ItemRarity, ItemXpService,
    LeagueService, LevelProgress, LevelService, PlayerArea, PlayerLevel, ProfileCheckInput,
    ProfileCheckReport, ProfileCheckService, ProfileIdentity, ProfileIdentityInput,
    ProfileIdentityIssue, ProfileIdentityService, ProfileIssue, ProfileName, ProfileNameService,
    ProfileScore, ProfileScoreInput, ProfileScoreService, ProfileUid, ProfileUidService,
    ProfileWallet, ProfileWalletInput, ProfileWalletService, RarityService, SkinService,
    SkinUnlock, Trophy, UnlockName, UnlockService, Unlocks, Xp,
};
pub use slug::{ItemName, Slug, SlugService};
