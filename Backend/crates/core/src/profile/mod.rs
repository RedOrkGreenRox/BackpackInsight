//! Profile-root domain pieces.
//!
//! This module intentionally stays split by responsibility:
//! level math lives in `level`, area math lives in `area`, hero rules live in
//! `heroes/*`, item rules live in `items/*`, unlock rules live in `unlocks/*`,
//! shared small value types live in `types`.

mod area;
mod check;
pub mod heroes;
pub mod identity;
pub mod items;
mod level;
mod score;
mod types;
pub mod unlocks;
pub mod wallet;

pub use area::AreaService;
pub use check::{ProfileCheckInput, ProfileCheckReport, ProfileCheckService, ProfileIssue};
pub use heroes::{
    Hero, HeroInput, HeroLeague, HeroLevel, HeroLevelService, HeroName, HeroNameService,
    HeroRating, HeroService, LeagueService,
};
pub use identity::{
    ProfileIdentity, ProfileIdentityInput, ProfileIdentityIssue, ProfileIdentityService,
    ProfileName, ProfileNameService, ProfileUid, ProfileUidService,
};
pub use items::{
    Cards, CardsService, ItemLevel, ItemLevelInfo, ItemLevelService, ItemRarity, ItemXpService,
    RarityService,
};
pub use level::LevelService;
pub use score::{BonusTrophy, ProfileScore, ProfileScoreInput, ProfileScoreService, Trophy};
pub use types::{LevelProgress, PlayerArea, PlayerLevel, Xp};
pub use unlocks::{
    BannerService, BannerUnlock, SkinService, SkinUnlock, UnlockName, UnlockService, Unlocks,
};
pub use wallet::{Coins, Gems, ProfileWallet, ProfileWalletInput, ProfileWalletService};
