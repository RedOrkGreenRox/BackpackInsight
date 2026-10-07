use super::{ProfileIdentityInput, ProfileName};

/// Name read rules for profile identity.
pub struct ProfileNameService;

impl ProfileNameService {
    pub fn read(input: &ProfileIdentityInput) -> Option<ProfileName> {
        input.name.as_deref().and_then(ProfileName::new)
    }
}

#[cfg(test)]
mod tests {
    use super::{ProfileIdentityInput, ProfileNameService};

    #[test]
    fn trims_name() {
        let input = ProfileIdentityInput {
            outer_uid: None,
            data_uid: None,
            name: Some("  Player  ".to_string()),
        };

        let Some(name) = ProfileNameService::read(&input) else {
            panic!("name should exist");
        };
        assert_eq!(name.as_str(), "Player");
    }

    #[test]
    fn blank_name_is_missing() {
        let input = ProfileIdentityInput {
            outer_uid: None,
            data_uid: None,
            name: Some(" ".to_string()),
        };

        assert!(ProfileNameService::read(&input).is_none());
    }
}
