use std::{collections::BTreeMap, fmt};

/// Small alphanumeric name extracted from an unlock string.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct UnlockName(String);

impl UnlockName {
    pub fn new(value: impl Into<String>) -> Option<Self> {
        let value = value.into();
        (!value.is_empty() && value.chars().all(|ch| ch.is_ascii_alphanumeric()))
            .then_some(Self(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for UnlockName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Parsed skin unlock: `{owner}Skin{skin}`.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SkinUnlock {
    pub owner: UnlockName,
    pub skin: UnlockName,
}

/// Parsed banner unlock: `{name}Banner...`.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct BannerUnlock {
    pub name: UnlockName,
}

/// Collected profile cosmetics, compatible with current frontend shape.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Unlocks {
    pub skins: BTreeMap<String, Vec<String>>,
    pub banners: Vec<String>,
}
