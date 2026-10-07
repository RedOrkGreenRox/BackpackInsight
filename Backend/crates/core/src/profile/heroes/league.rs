use super::{HeroLeague, HeroRating};

const HERO_LEAGUES: &[&str] = &[
    "Bronze",
    "Silver",
    "Gold",
    "Emerald",
    "Ruby",
    "Sapphire",
    "Diamond",
    "Heroic",
    "Epic",
    "Legendary",
    "Mythic",
];

/// Hero rating-to-league math from current backend rules.
pub struct LeagueService;

impl LeagueService {
    pub fn from_rating(rating: HeroRating) -> HeroLeague {
        let index = (rating.0 / 500).min(10) as usize;
        HeroLeague(HERO_LEAGUES[index])
    }

    pub fn progress_in_tier(rating: HeroRating) -> u32 {
        rating.0 - 500 * (rating.0 / 500)
    }
}

#[cfg(test)]
mod tests {
    use super::{HeroRating, LeagueService};

    #[test]
    fn rating_maps_to_league() {
        assert_eq!(LeagueService::from_rating(HeroRating(0)).0, "Bronze");
        assert_eq!(LeagueService::from_rating(HeroRating(1200)).0, "Gold");
        assert_eq!(LeagueService::from_rating(HeroRating(5000)).0, "Mythic");
        assert_eq!(LeagueService::from_rating(HeroRating(9999)).0, "Mythic");
    }

    #[test]
    fn progress_matches_current_backend_formula() {
        assert_eq!(LeagueService::progress_in_tier(HeroRating(1200)), 200);
    }
}
