use crate::Xp;
use std::fmt;

/// Normalized hero display/domain name.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct HeroName(String);

impl HeroName {
    pub fn new(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for HeroName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Hero level after applying current backend prestige rules.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct HeroLevel(pub u32);

impl fmt::Display for HeroLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Hero rating points.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct HeroRating(pub u32);

impl fmt::Display for HeroRating {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Hero league name.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct HeroLeague(pub &'static str);

impl fmt::Display for HeroLeague {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.0)
    }
}

/// Raw profile hero input, before current backend normalization.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct HeroInput {
    pub raw_name: String,
    pub raw_level: u32,
    pub experience: Xp,
    pub rating: HeroRating,
}

/// Domain hero after normalization.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Hero {
    pub name: HeroName,
    pub level: HeroLevel,
    pub experience: Xp,
    pub exp_need: Xp,
    pub rating: HeroRating,
    pub prestige: bool,
    pub league: HeroLeague,
}
