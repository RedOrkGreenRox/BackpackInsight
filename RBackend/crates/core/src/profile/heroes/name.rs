use super::HeroName;

/// Normalizes raw hero ids/names into names used by the current app.
pub struct HeroNameService;

impl HeroNameService {
    pub fn normalize(raw_name: &str) -> HeroName {
        HeroName::new(match raw_name {
            "Barbarian" => "Harkon",
            "Elementalist" => "Chana",
            "Warrior" => "Ronan",
            "Marksman" => "Nymphedora",
            "Engineer" => "Tink",
            "Beekeeper" => "Buzz",
            "Hob" => "Hob",
            other => other,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::HeroNameService;

    #[test]
    fn known_legacy_names_are_normalized() {
        assert_eq!(HeroNameService::normalize("Warrior").as_str(), "Ronan");
        assert_eq!(
            HeroNameService::normalize("Marksman").as_str(),
            "Nymphedora"
        );
        assert_eq!(HeroNameService::normalize("Beekeeper").as_str(), "Buzz");
    }

    #[test]
    fn unknown_names_pass_through() {
        assert_eq!(HeroNameService::normalize("Fern").as_str(), "Fern");
    }
}
