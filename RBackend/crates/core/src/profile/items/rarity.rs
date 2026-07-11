use super::ItemRarity;
use std::str::FromStr;

/// Small parser/normalizer for rarity names.
pub struct RarityService;

impl RarityService {
    pub fn parse(value: &str) -> Result<ItemRarity, String> {
        ItemRarity::from_str(value)
    }
}

#[cfg(test)]
mod tests {
    use super::{ItemRarity, RarityService};

    #[test]
    fn parses_known_rarity() {
        assert_eq!(RarityService::parse("Legendary"), Ok(ItemRarity::Legendary));
    }

    #[test]
    fn rejects_unknown_rarity() {
        assert!(RarityService::parse("Godly").is_err());
    }
}
