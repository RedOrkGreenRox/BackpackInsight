use super::{ItemLevel, ItemRarity};
use crate::Xp;

const COMMON_EXP: &[u64] = &[
    0, 5, 10, 25, 50, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1200,
];
const RARE_EXP: &[u64] = &[
    0, 10, 20, 30, 50, 100, 160, 240, 320, 400, 480, 600, 800, 1000, 1200,
];
const EPIC_EXP: &[u64] = &[
    0, 20, 30, 50, 75, 125, 200, 300, 400, 500, 600, 750, 900, 1200, 1500,
];
const LEGENDARY_EXP: &[u64] = &[
    0, 60, 90, 120, 150, 180, 225, 300, 375, 450, 600, 750, 900, 1200, 1500,
];
const MYTHIC_EXP: &[u64] = &[
    0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 1000, 1200, 1400, 1600,
];
const UNIQUE_EXP: &[u64] = MYTHIC_EXP;
const RELIC_EXP: &[u64] = &[0, 100, 200, 300, 400, 500, 600, 700, 800, 1000];

/// Item XP math from current backend `Item.total_xp`.
pub struct ItemXpService;

impl ItemXpService {
    pub fn total_xp(rarity: ItemRarity, level: ItemLevel) -> Xp {
        if matches!(rarity, ItemRarity::Boon | ItemRarity::Special) {
            return Xp(0);
        }

        let Some(table) = exp_table(rarity) else {
            return Xp(0);
        };

        let end = (level.0 as usize).min(table.len());
        Xp(table[..end].iter().sum())
    }
}

fn exp_table(rarity: ItemRarity) -> Option<&'static [u64]> {
    match rarity {
        ItemRarity::Common => Some(COMMON_EXP),
        ItemRarity::Rare => Some(RARE_EXP),
        ItemRarity::Epic => Some(EPIC_EXP),
        ItemRarity::Legendary => Some(LEGENDARY_EXP),
        ItemRarity::Mythic => Some(MYTHIC_EXP),
        ItemRarity::Unique => Some(UNIQUE_EXP),
        ItemRarity::Relic => Some(RELIC_EXP),
        ItemRarity::Boon | ItemRarity::Special => None,
    }
}

#[cfg(test)]
mod tests {
    use super::{ItemLevel, ItemRarity, ItemXpService};

    #[test]
    fn common_level_ten_matches_backend_sum() {
        assert_eq!(
            ItemXpService::total_xp(ItemRarity::Common, ItemLevel(10)).0,
            1240
        );
    }

    #[test]
    fn boon_and_special_have_zero_xp() {
        assert_eq!(
            ItemXpService::total_xp(ItemRarity::Boon, ItemLevel(10)).0,
            0
        );
        assert_eq!(
            ItemXpService::total_xp(ItemRarity::Special, ItemLevel(10)).0,
            0
        );
    }

    #[test]
    fn level_beyond_table_saturates_like_python_slice() {
        assert_eq!(
            ItemXpService::total_xp(ItemRarity::Relic, ItemLevel(99)).0,
            ItemXpService::total_xp(ItemRarity::Relic, ItemLevel(10)).0
        );
    }
}
