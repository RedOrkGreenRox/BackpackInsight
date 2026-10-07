//! Small profile identity roots: UID and Name.

mod name;
mod types;
mod uid;

pub use name::ProfileNameService;
pub use types::{
    ProfileIdentity, ProfileIdentityInput, ProfileIdentityIssue, ProfileName, ProfileUid,
};
pub use uid::ProfileUidService;

/// Thin identity assembler.
pub struct ProfileIdentityService;

impl ProfileIdentityService {
    pub fn read(
        input: &ProfileIdentityInput,
    ) -> Result<ProfileIdentity, Vec<ProfileIdentityIssue>> {
        let uid = ProfileUidService::read(input);
        let name = ProfileNameService::read(input);

        match (uid, name) {
            (Some(uid), Some(name)) => Ok(ProfileIdentity { uid, name }),
            (uid, name) => {
                let mut issues = Vec::new();
                if uid.is_none() {
                    issues.push(ProfileIdentityIssue::MissingUid);
                }
                if name.is_none() {
                    issues.push(ProfileIdentityIssue::MissingName);
                }
                Err(issues)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{ProfileIdentityInput, ProfileIdentityIssue, ProfileIdentityService};

    #[test]
    fn reads_identity() {
        let input = ProfileIdentityInput {
            outer_uid: Some("root".to_string()),
            data_uid: None,
            name: Some("Player".to_string()),
        };

        let identity = ProfileIdentityService::read(&input).unwrap_or_else(|issues| {
            panic!("identity should be valid: {issues:?}");
        });

        assert_eq!(identity.uid.as_str(), "root");
        assert_eq!(identity.name.as_str(), "Player");
    }

    #[test]
    fn reports_missing_parts() {
        let input = ProfileIdentityInput::default();
        let Err(issues) = ProfileIdentityService::read(&input) else {
            panic!("identity should be invalid");
        };

        assert_eq!(
            issues,
            [
                ProfileIdentityIssue::MissingUid,
                ProfileIdentityIssue::MissingName,
            ]
        );
    }
}
