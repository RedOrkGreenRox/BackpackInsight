use super::{Cards, ItemLevel, ItemRarity};

const COMMON_CARDS: &[u32] = &[
    0, 5, 10, 25, 50, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1200,
];
const RARE_CARDS: &[u32] = &[
    0, 5, 10, 15, 25, 50, 80, 120, 160, 200, 240, 300, 400, 500, 600,
];
const EPIC_CARDS: &[u32] = &[
    0, 4, 6, 10, 15, 25, 40, 60, 80, 100, 120, 150, 180, 240, 300,
];
const LEGENDARY_CARDS: &[u32] = &[0, 4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100];
const MYTHIC_CARDS: &[u32] = &[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 25, 30, 35, 40];
const UNIQUE_CARDS: &[u32] = MYTHIC_CARDS;
const RELIC_CARDS: &[u32] = &[0, 40, 60, 100, 300, 500, 800, 1200, 1600, 2000];

/// Cards-needed math from current backend `Item.cards_need`.
pub struct CardsService;

impl CardsService {
    pub fn cards_need(rarity: ItemRarity, level: ItemLevel) -> Option<Cards> {
        if level.0 >= 15 || (rarity == ItemRarity::Relic && level.0 >= 10) {
            return None;
        }

        if matches!(rarity, ItemRarity::Boon | ItemRarity::Special) {
            return None;
        }

        let table = cards_table(rarity)?;
        table
            .get(level.0.saturating_sub(1) as usize)
            .copied()
            .map(Cards)
    }

    pub fn is_upgradable(cards: Cards, cards_need: Option<Cards>) -> bool {
        cards_need.is_some_and(|need| cards.0 >= need.0)
    }
}

fn cards_table(rarity: ItemRarity) -> Option<&'static [u32]> {
    match rarity {
        ItemRarity::Common => Some(COMMON_CARDS),
        ItemRarity::Rare => Some(RARE_CARDS),
        ItemRarity::Epic => Some(EPIC_CARDS),
        ItemRarity::Legendary => Some(LEGENDARY_CARDS),
        ItemRarity::Mythic => Some(MYTHIC_CARDS),
        ItemRarity::Unique => Some(UNIQUE_CARDS),
        ItemRarity::Relic => Some(RELIC_CARDS),
        ItemRarity::Boon | ItemRarity::Special => None,
    }
}

#[cfg(test)]
mod tests {
    use super::{Cards, CardsService, ItemLevel, ItemRarity};

    #[test]
    fn common_level_ten_needs_current_table_value() {
        assert_eq!(
            CardsService::cards_need(ItemRarity::Common, ItemLevel(10)),
            Some(Cards(400))
        );
    }

    #[test]
    fn maxed_level_returns_none_like_backend_minus_one() {
        assert_eq!(
            CardsService::cards_need(ItemRarity::Common, ItemLevel(15)),
            None
        );
        assert_eq!(
            CardsService::cards_need(ItemRarity::Relic, ItemLevel(10)),
            None
        );
    }

    #[test]
    fn boon_and_special_do_not_level_with_cards() {
        assert_eq!(
            CardsService::cards_need(ItemRarity::Boon, ItemLevel(1)),
            None
        );
        assert_eq!(
            CardsService::cards_need(ItemRarity::Special, ItemLevel(1)),
            None
        );
    }

    #[test]
    fn upgradable_requires_existing_need() {
        assert!(CardsService::is_upgradable(Cards(400), Some(Cards(400))));
        assert!(!CardsService::is_upgradable(Cards(399), Some(Cards(400))));
        assert!(!CardsService::is_upgradable(Cards(9999), None));
    }
}
