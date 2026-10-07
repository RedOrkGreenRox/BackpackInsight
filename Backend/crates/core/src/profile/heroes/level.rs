use super::HeroLevel;
use crate::Xp;

const HERO_LEVELING_EXP: &[(u32, u64)] = &[
    (1, 0),
    (2, 100),
    (3, 200),
    (4, 350),
    (5, 500),
    (6, 650),
    (7, 800),
    (8, 1000),
    (9, 1200),
    (10, 1400),
    (11, 1650),
    (12, 1900),
    (13, 2200),
    (14, 2500),
    (15, 2850),
    (16, 3200),
    (17, 3600),
    (18, 4050),
    (19, 4500),
    (20, 5000),
];

/// Hero level/prestige math from current backend rules.
pub struct HeroLevelService;

impl HeroLevelService {
    pub fn from_raw_level(raw_level: u32) -> (HeroLevel, bool) {
        let mut level = raw_level + 1;
        let mut prestige = false;

        if level > 20 {
            level -= 20;
            prestige = true;
        }

        (HeroLevel(level), prestige)
    }

    pub fn exp_need(level: HeroLevel) -> Xp {
        let next_level = level.0 + 1;

        if next_level <= 20 {
            return Xp(hero_level_exp(next_level).unwrap_or(0));
        }

        let calculated = 1000 + 100 * u64::from(next_level.saturating_sub(21));
        Xp(calculated.min(3000))
    }
}

fn hero_level_exp(level: u32) -> Option<u64> {
    HERO_LEVELING_EXP
        .iter()
        .find_map(|(candidate, xp)| (*candidate == level).then_some(*xp))
}

#[cfg(test)]
mod tests {
    use super::HeroLevelService;

    #[test]
    fn raw_level_is_zero_based() {
        let (level, prestige) = HeroLevelService::from_raw_level(5);
        assert_eq!(level.0, 6);
        assert!(!prestige);
    }

    #[test]
    fn level_above_twenty_becomes_prestige() {
        let (level, prestige) = HeroLevelService::from_raw_level(25);
        assert_eq!(level.0, 6);
        assert!(prestige);
    }

    #[test]
    fn exp_need_uses_next_level_like_current_backend() {
        let (level, _) = HeroLevelService::from_raw_level(5);
        assert_eq!(HeroLevelService::exp_need(level).0, 800);
    }

    #[test]
    fn exp_need_after_twenty_is_capped() {
        assert_eq!(HeroLevelService::exp_need(super::HeroLevel(50)).0, 3000);
    }
}
