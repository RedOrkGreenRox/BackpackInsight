//! Порядок редкостей для сортировки каталога (как `RARITY_WEIGHTS` в TS-версии).

use rbackend_core::ItemRarity;

/// Место редкости в порядке «от ценной к простой». Сопоставление полное:
/// новая редкость в модели не соберётся, пока ей не найдут место здесь.
#[must_use]
pub fn rank(rarity: ItemRarity) -> u8 {
    match rarity {
        ItemRarity::Unique => 0,
        ItemRarity::Mythic => 1,
        ItemRarity::Legendary => 2,
        ItemRarity::Epic => 3,
        ItemRarity::Rare => 4,
        ItemRarity::Common => 5,
        ItemRarity::Boon => 6,
        ItemRarity::Relic => 7,
        ItemRarity::Special => 8,
    }
}

#[cfg(test)]
mod tests {
    use super::{rank, ItemRarity};

    #[test]
    fn unique_first_special_last() {
        assert!(rank(ItemRarity::Unique) < rank(ItemRarity::Mythic));
        assert!(rank(ItemRarity::Common) < rank(ItemRarity::Special));
        assert_eq!(rank(ItemRarity::Special), 8);
    }
}
