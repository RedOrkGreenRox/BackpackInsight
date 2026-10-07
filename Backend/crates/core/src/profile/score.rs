use super::{AreaService, PlayerArea};
use std::fmt;

/// Regular trophy count from profile.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct Trophy(pub u64);

impl fmt::Display for Trophy {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Bonus trophy count from profile.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub struct BonusTrophy(pub u64);

impl fmt::Display for BonusTrophy {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Minimal score input. It can be built from JSON today and FlatBuffers later.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct ProfileScoreInput {
    pub trophy: Option<u64>,
    pub bonus_trophy: Option<u64>,
}

/// Read score summary.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ProfileScore {
    pub trophy: Trophy,
    pub bonus_trophy: BonusTrophy,
    pub total_trophies: Trophy,
    pub area: PlayerArea,
}

/// Trophy/area read rules.
pub struct ProfileScoreService;

impl ProfileScoreService {
    pub fn read(input: &ProfileScoreInput) -> ProfileScore {
        let trophy = Trophy(input.trophy.unwrap_or(0));
        let bonus_trophy = BonusTrophy(input.bonus_trophy.unwrap_or(0));
        let total_trophies = Trophy(trophy.0.saturating_add(bonus_trophy.0));
        let area = AreaService::from_trophies(trophy.0, bonus_trophy.0);

        ProfileScore {
            trophy,
            bonus_trophy,
            total_trophies,
            area,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{ProfileScoreInput, ProfileScoreService};

    #[test]
    fn reads_trophy_bonus_total_and_area() {
        let score = ProfileScoreService::read(&ProfileScoreInput {
            trophy: Some(5000),
            bonus_trophy: Some(250),
        });

        assert_eq!(score.trophy.0, 5000);
        assert_eq!(score.bonus_trophy.0, 250);
        assert_eq!(score.total_trophies.0, 5250);
        assert_eq!(score.area.code(), "14");
    }

    #[test]
    fn missing_values_default_to_zero() {
        let score = ProfileScoreService::read(&ProfileScoreInput::default());

        assert_eq!(score.trophy.0, 0);
        assert_eq!(score.bonus_trophy.0, 0);
        assert_eq!(score.total_trophies.0, 0);
        assert_eq!(score.area.code(), "01");
    }
}
