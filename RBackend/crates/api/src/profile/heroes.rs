use rbackend_core::{HeroInput, HeroRating, HeroService, Xp};
use serde::Serialize;
use serde_json::Value;

#[derive(Debug, Clone, Serialize)]
pub struct ProfileHeroView {
    pub name: String,
    pub level: u32,
    pub rating: u32,
    pub experience: u64,
    pub exp_req: u64,
    pub prestige: bool,
    pub league: String,
    pub skin_num: &'static str,
}

pub fn read_heroes(json: &Value) -> Vec<ProfileHeroView> {
    let Some(heroes) = json.get("Hero").and_then(Value::as_object) else {
        return Vec::new();
    };

    heroes
        .iter()
        .filter_map(|(raw_name, raw_value)| read_hero(raw_name, raw_value))
        .collect()
}

fn read_hero(raw_name: &str, raw_value: &Value) -> Option<ProfileHeroView> {
    let raw = raw_value.as_str()?;
    let mut parts = raw.split(':');
    let raw_level = parts.next()?.parse::<u32>().ok()?;
    let experience = parts.next()?.parse::<u64>().ok()?;
    let rating = parts.next()?.parse::<u32>().ok()?;

    let hero = HeroService::read(HeroInput {
        raw_name: raw_name.to_string(),
        raw_level,
        experience: Xp(experience),
        rating: HeroRating(rating),
    });

    Some(ProfileHeroView {
        name: hero.name.to_string(),
        level: hero.level.0,
        rating: hero.rating.0,
        experience: hero.experience.0,
        exp_req: hero.exp_need.0,
        prestige: hero.prestige,
        league: hero.league.to_string(),
        skin_num: "01",
    })
}

#[cfg(test)]
mod tests {
    use super::read_heroes;
    use serde_json::json;

    #[test]
    fn reads_frontend_hero_view() {
        let heroes = read_heroes(&json!({
            "Hero": {
                "Warrior": "14:3151:3281",
                "Barbarian": "25:500:5000"
            }
        }));

        assert_eq!(heroes.len(), 2);
        let ronan = heroes
            .iter()
            .find(|hero| hero.name == "Ronan")
            .unwrap_or_else(|| panic!("Ronan should be present"));
        assert_eq!(ronan.level, 15);
        assert_eq!(ronan.experience, 3151);
        assert_eq!(ronan.exp_req, 3200);
        assert_eq!(ronan.league, "Diamond");
        assert!(!ronan.prestige);

        let harkon = heroes
            .iter()
            .find(|hero| hero.name == "Harkon")
            .unwrap_or_else(|| panic!("Harkon should be present"));
        assert_eq!(harkon.level, 6);
        assert!(harkon.prestige);
        assert_eq!(harkon.league, "Mythic");
    }

    #[test]
    fn skips_malformed_heroes() {
        let heroes = read_heroes(&json!({
            "Hero": {
                "Warrior": "bad",
                "Barbarian": "1:2:3"
            }
        }));

        assert_eq!(heroes.len(), 1);
        assert_eq!(heroes[0].name, "Harkon");
    }
}
