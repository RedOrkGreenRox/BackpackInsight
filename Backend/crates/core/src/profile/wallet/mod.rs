//! Small profile wallet root: coins and gems together.
//!
//! Wallet is intentionally not split per field. Coins and gems form one tiny
//! responsibility here: reading the base currency with default-zero rules.

mod read;
mod types;

pub use read::ProfileWalletService;
pub use types::{Coins, Gems, ProfileWallet, ProfileWalletInput};
