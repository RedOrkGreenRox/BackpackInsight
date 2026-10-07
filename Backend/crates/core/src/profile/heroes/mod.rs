//! Small hero roots: name normalization, level/prestige, league.

mod league;
mod level;
mod name;
mod types;

pub use league::LeagueService;
pub use level::HeroLevelService;
pub use name::HeroNameService;
pub use types::{Hero, HeroInput, HeroLeague, HeroLevel, HeroName, HeroRating};

/// Thin assembler for hero domain values.
///
/// This is intentionally not named `HeroFactory`: heavy factory-style names are
/// avoided in the Rust root system.
pub struct HeroService;

impl HeroService {
    pub fn read(input: HeroInput) -> Hero {
        let name = HeroNameService::normalize(&input.raw_name);
        let (level, prestige) = HeroLevelService::from_raw_level(input.raw_level);
        let exp_need = HeroLevelService::exp_need(level);
        let league = LeagueService::from_rating(input.rating);

        Hero {
            name,
            level,
            experience: input.experience,
            exp_need,
            rating: input.rating,
            prestige,
            league,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{HeroInput, HeroRating, HeroService};
    use crate::Xp;

    #[test]
    fn hero_service_matches_current_backend_shape() {
        let hero = HeroService::read(HeroInput {
            raw_name: "Warrior".to_string(),
            raw_level: 25,
            experience: Xp(500),
            rating: HeroRating(5000),
        });

        assert_eq!(hero.name.as_str(), "Ronan");
        assert_eq!(hero.level.0, 6);
        assert!(hero.prestige);
        assert_eq!(hero.experience.0, 500);
        assert_eq!(hero.league.0, "Mythic");
    }
}
