use std::fmt;

/// Coin amount from profile currency.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Coins(pub u64);

impl fmt::Display for Coins {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Gem amount from profile currency.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Gems(pub u64);

impl fmt::Display for Gems {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Minimal wallet input. It can be built from JSON today and FlatBuffers later.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct ProfileWalletInput {
    pub coins: Option<u64>,
    pub gems: Option<u64>,
}

/// Read profile wallet.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct ProfileWallet {
    pub coins: Coins,
    pub gems: Gems,
}
