use std::fmt;

/// Compact typed item id for future DOD catalog rows.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ItemId(u32);

impl ItemId {
    pub const fn new(raw: u32) -> Self {
        Self(raw)
    }

    pub const fn raw(self) -> u32 {
        self.0
    }

    pub const fn index(self) -> usize {
        self.0 as usize
    }
}

impl fmt::Display for ItemId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "item#{}", self.0)
    }
}

/// Compact typed hero id for future DOD catalog/profile rows.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct HeroId(u16);

impl HeroId {
    pub const fn new(raw: u16) -> Self {
        Self(raw)
    }

    pub const fn raw(self) -> u16 {
        self.0
    }

    pub const fn index(self) -> usize {
        self.0 as usize
    }
}

impl fmt::Display for HeroId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "hero#{}", self.0)
    }
}

/// Compact typed string id produced by `StringPool`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct StringId(u32);

impl StringId {
    pub const fn new(raw: u32) -> Self {
        Self(raw)
    }

    pub const fn raw(self) -> u32 {
        self.0
    }

    pub const fn index(self) -> usize {
        self.0 as usize
    }
}

impl fmt::Display for StringId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "str#{}", self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::{HeroId, ItemId, StringId};

    #[test]
    fn typed_ids_keep_raw_and_index_values() {
        assert_eq!(ItemId::new(7).raw(), 7);
        assert_eq!(ItemId::new(7).index(), 7);
        assert_eq!(HeroId::new(3).raw(), 3);
        assert_eq!(StringId::new(11).index(), 11);
    }

    #[test]
    fn typed_ids_have_readable_display() {
        assert_eq!(ItemId::new(7).to_string(), "item#7");
        assert_eq!(HeroId::new(3).to_string(), "hero#3");
        assert_eq!(StringId::new(11).to_string(), "str#11");
    }
}
