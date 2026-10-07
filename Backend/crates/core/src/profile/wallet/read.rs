use super::{Coins, Gems, ProfileWallet, ProfileWalletInput};

/// Wallet read rules for profile currency.
///
/// Coins and gems stay together because they are one small responsibility:
/// reading the current base wallet with default-zero compatibility rules.
pub struct ProfileWalletService;

impl ProfileWalletService {
    pub fn read(input: &ProfileWalletInput) -> ProfileWallet {
        ProfileWallet {
            coins: Coins(input.coins.unwrap_or(0)),
            gems: Gems(input.gems.unwrap_or(0)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{ProfileWalletInput, ProfileWalletService};

    #[test]
    fn reads_wallet_values() {
        let input = ProfileWalletInput {
            coins: Some(99999),
            gems: Some(500),
        };
        let wallet = ProfileWalletService::read(&input);

        assert_eq!(wallet.coins.0, 99999);
        assert_eq!(wallet.gems.0, 500);
    }

    #[test]
    fn missing_values_default_to_zero() {
        let wallet = ProfileWalletService::read(&ProfileWalletInput::default());

        assert_eq!(wallet.coins.0, 0);
        assert_eq!(wallet.gems.0, 0);
    }

    #[test]
    fn can_read_only_one_side() {
        let wallet = ProfileWalletService::read(&ProfileWalletInput {
            coins: Some(123),
            gems: None,
        });

        assert_eq!(wallet.coins.0, 123);
        assert_eq!(wallet.gems.0, 0);
    }
}
