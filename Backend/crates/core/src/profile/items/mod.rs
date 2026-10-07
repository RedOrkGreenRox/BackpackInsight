//! Small item roots: rarity, cards-needed math, XP math.

mod cards;
mod rarity;
mod types;
mod xp;

pub use cards::CardsService;
pub use rarity::RarityService;
pub use types::{Cards, ItemLevel, ItemLevelInfo, ItemRarity};
pub use xp::ItemXpService;

/// Thin item level assembler.
///
/// This intentionally stays small and only combines the separate roots.
pub struct ItemLevelService;

impl ItemLevelService {
    pub fn inspect(rarity: ItemRarity, level: ItemLevel, cards: Cards) -> ItemLevelInfo {
        let cards_need = CardsService::cards_need(rarity, level);
        let total_xp = ItemXpService::total_xp(rarity, level);
        let upgradable = CardsService::is_upgradable(cards, cards_need);

        ItemLevelInfo {
            cards_need,
            total_xp,
            upgradable,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Cards, ItemLevel, ItemLevelService, ItemRarity};

    #[test]
    fn inspect_combines_cards_xp_and_upgradable() {
        let info = ItemLevelService::inspect(ItemRarity::Common, ItemLevel(10), Cards(500));
        assert_eq!(info.cards_need, Some(Cards(400)));
        assert_eq!(info.total_xp.0, 1240);
        assert!(info.upgradable);
    }
}
