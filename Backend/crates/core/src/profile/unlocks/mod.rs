//! Small unlock roots: skins and banners.

mod banners;
mod skins;
mod types;

pub use banners::BannerService;
pub use skins::SkinService;
pub use types::{BannerUnlock, SkinUnlock, UnlockName, Unlocks};

/// Thin unlock assembler.
pub struct UnlockService;

impl UnlockService {
    pub fn inspect<'a>(values: impl IntoIterator<Item = &'a str>) -> Unlocks {
        let mut unlocks = Unlocks::default();

        for value in values {
            if let Some(skin) = SkinService::parse(value) {
                unlocks
                    .skins
                    .entry(skin.owner.to_string())
                    .or_default()
                    .push(skin.skin.to_string());
            }

            if let Some(banner) = BannerService::parse(value) {
                unlocks.banners.push(banner.name.to_string());
            }
        }

        unlocks
    }
}

#[cfg(test)]
mod tests {
    use super::UnlockService;

    #[test]
    fn collects_skins_and_banners() {
        let unlocks = UnlockService::inspect([
            "NymphedoraSkin02",
            "NymphedoraSkin03",
            "Season01Banner01",
            "QuestUnlockPlayerLevelRewardData",
        ]);

        assert_eq!(unlocks.skins["Nymphedora"], ["02", "03"]);
        assert_eq!(unlocks.banners, ["Season01"]);
    }
}
