use pack::{read_profile_view_bytes, ProfileViewPack};
use serde::Serialize;
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ProfileData {
    pub nickname: String,
    pub level: u64,
    pub trophy: u64,
    pub bonus_trophy: u64,
    pub gems: u64,
    pub coins: u64,
    pub xp_current: u64,
    pub xp_need: u64,
    pub area: String,
    pub item_stats: BTreeMap<String, u64>,
    pub heroes: Vec<HeroData>,
    pub items: Vec<ProfileItemData>,
    pub actual_version: Option<String>,
    pub install_version: Option<String>,
    pub profile_skins: BTreeMap<String, Vec<String>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct HeroData {
    pub name: String,
    pub level: u32,
    pub rating: u32,
    pub experience: u64,
    pub exp_req: u64,
    pub prestige: bool,
    pub league: String,
    pub skin_num: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ProfileItemData {
    pub name: String,
    pub rarity: String,
    pub level: u32,
    pub cards: u32,
    pub cards_need: i32,
}

pub fn decode_profile(bytes: &[u8]) -> Result<ProfileData, String> {
    read_profile_view_bytes(bytes).map(profile_from_pack)
}

fn profile_from_pack(profile: ProfileViewPack) -> ProfileData {
    ProfileData {
        nickname: profile.nickname,
        level: profile.level,
        trophy: profile.trophy,
        bonus_trophy: profile.bonus_trophy,
        gems: profile.gems,
        coins: profile.coins,
        xp_current: profile.xp_current,
        xp_need: profile.xp_need,
        area: profile.area,
        item_stats: profile.item_stats.into_iter().collect(),
        heroes: profile
            .heroes
            .into_iter()
            .map(|hero| HeroData {
                name: hero.name,
                level: hero.level,
                rating: hero.rating,
                experience: hero.experience,
                exp_req: hero.exp_req,
                prestige: hero.prestige,
                league: hero.league,
                skin_num: hero.skin_num,
            })
            .collect(),
        items: profile
            .items
            .into_iter()
            .map(|item| ProfileItemData {
                name: item.name,
                rarity: item.rarity,
                level: item.level,
                cards: item.cards,
                cards_need: item.cards_need,
            })
            .collect(),
        actual_version: profile.actual_version,
        install_version: profile.install_version,
        profile_skins: profile.profile_skins.into_iter().collect(),
    }
}

#[cfg(test)]
mod tests {
    use super::decode_profile;

    #[test]
    fn rejects_invalid_profile_pack() {
        assert!(decode_profile(b"not a profile").is_err());
    }
}
