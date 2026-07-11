use std::fmt;

/// Total or current experience points.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Xp(pub u64);

impl fmt::Display for Xp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Player level.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct PlayerLevel(pub u64);

impl fmt::Display for PlayerLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Two-digit area code used by the current frontend assets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct PlayerArea(pub u8);

impl PlayerArea {
    pub fn code(self) -> String {
        format!("{:02}", self.0)
    }
}

impl fmt::Display for PlayerArea {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.code())
    }
}

/// Level calculation result.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct LevelProgress {
    pub level: PlayerLevel,
    pub current: Xp,
    pub need: Xp,
}
