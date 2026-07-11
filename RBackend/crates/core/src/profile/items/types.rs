use crate::Xp;
use std::{fmt, str::FromStr};

/// Item rarity values known by the current game catalog.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum ItemRarity {
    Common,
    Rare,
    Epic,
    Legendary,
    Mythic,
    Unique,
    Relic,
    Boon,
    Special,
}

impl ItemRarity {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Common => "Common",
            Self::Rare => "Rare",
            Self::Epic => "Epic",
            Self::Legendary => "Legendary",
            Self::Mythic => "Mythic",
            Self::Unique => "Unique",
            Self::Relic => "Relic",
            Self::Boon => "Boon",
            Self::Special => "Special",
        }
    }
}

impl fmt::Display for ItemRarity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl FromStr for ItemRarity {
    type Err = String;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "Common" => Ok(Self::Common),
            "Rare" => Ok(Self::Rare),
            "Epic" => Ok(Self::Epic),
            "Legendary" => Ok(Self::Legendary),
            "Mythic" => Ok(Self::Mythic),
            "Unique" => Ok(Self::Unique),
            "Relic" => Ok(Self::Relic),
            "Boon" => Ok(Self::Boon),
            "Special" => Ok(Self::Special),
            other => Err(format!("unknown item rarity: {other}")),
        }
    }
}

/// 1-based item level used by the current backend after raw profile parsing.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ItemLevel(pub u32);

impl fmt::Display for ItemLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Item cards count.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Cards(pub u32);

impl fmt::Display for Cards {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Current item level math result.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ItemLevelInfo {
    pub cards_need: Option<Cards>,
    pub total_xp: Xp,
    pub upgradable: bool,
}
