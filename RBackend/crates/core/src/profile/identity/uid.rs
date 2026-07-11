use super::{ProfileIdentityInput, ProfileUid};

/// UID selection rules for profile identity.
pub struct ProfileUidService;

impl ProfileUidService {
    pub fn read(input: &ProfileIdentityInput) -> Option<ProfileUid> {
        input
            .data_uid
            .as_deref()
            .and_then(ProfileUid::new)
            .or_else(|| input.outer_uid.as_deref().and_then(ProfileUid::new))
    }
}

#[cfg(test)]
mod tests {
    use super::{ProfileIdentityInput, ProfileUidService};

    #[test]
    fn data_uid_has_priority() {
        let input = ProfileIdentityInput {
            outer_uid: Some("root".to_string()),
            data_uid: Some("data".to_string()),
            name: None,
        };

        let Some(uid) = ProfileUidService::read(&input) else {
            panic!("uid should exist");
        };
        assert_eq!(uid.as_str(), "data");
    }

    #[test]
    fn outer_uid_is_fallback() {
        let input = ProfileIdentityInput {
            outer_uid: Some("root".to_string()),
            data_uid: Some(" ".to_string()),
            name: None,
        };

        let Some(uid) = ProfileUidService::read(&input) else {
            panic!("uid should exist");
        };
        assert_eq!(uid.as_str(), "root");
    }
}
