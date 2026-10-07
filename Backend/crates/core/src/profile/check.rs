use std::fmt;

/// Minimal profile shape needed for basic validation.
///
/// `core` intentionally does not depend on JSON here. Any caller can build
/// this input from JSON, FlatBuffers, tests, or future transport formats.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ProfileCheckInput {
    pub has_data: bool,
    pub outer_uid: Option<String>,
    pub data_uid: Option<String>,
    pub name: Option<String>,
    pub has_hero: bool,
    pub has_item: bool,
}

impl ProfileCheckInput {
    pub fn uid(&self) -> Option<&str> {
        self.data_uid
            .as_deref()
            .filter(|value| !value.trim().is_empty())
            .or_else(|| {
                self.outer_uid
                    .as_deref()
                    .filter(|value| !value.trim().is_empty())
            })
    }

    pub fn clean_name(&self) -> Option<&str> {
        self.name
            .as_deref()
            .filter(|value| !value.trim().is_empty())
    }
}

/// One basic validation issue.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum ProfileIssue {
    MissingData,
    MissingUid,
    MissingName,
    MissingHeroAndItem,
}

impl fmt::Display for ProfileIssue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let value = match self {
            Self::MissingData => "missing Data section",
            Self::MissingUid => "missing UID in root or Data",
            Self::MissingName => "missing Name",
            Self::MissingHeroAndItem => "missing Hero and Item sections",
        };
        f.write_str(value)
    }
}

/// Basic profile validation report.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileCheckReport {
    pub issues: Vec<ProfileIssue>,
}

impl ProfileCheckReport {
    pub fn is_valid(&self) -> bool {
        self.issues.is_empty()
    }
}

/// Basic profile shape checker.
pub struct ProfileCheckService;

impl ProfileCheckService {
    pub fn check(input: &ProfileCheckInput) -> ProfileCheckReport {
        let mut issues = Vec::new();

        if !input.has_data {
            issues.push(ProfileIssue::MissingData);
        }

        if input.uid().is_none() {
            issues.push(ProfileIssue::MissingUid);
        }

        if input.clean_name().is_none() {
            issues.push(ProfileIssue::MissingName);
        }

        if !input.has_hero && !input.has_item {
            issues.push(ProfileIssue::MissingHeroAndItem);
        }

        ProfileCheckReport { issues }
    }
}

#[cfg(test)]
mod tests {
    use super::{ProfileCheckInput, ProfileCheckService, ProfileIssue};

    #[test]
    fn accepts_current_minimal_shape_with_outer_uid() {
        let input = ProfileCheckInput {
            has_data: true,
            outer_uid: Some("root-uid".to_string()),
            data_uid: None,
            name: Some("Player".to_string()),
            has_hero: false,
            has_item: true,
        };

        assert!(ProfileCheckService::check(&input).is_valid());
    }

    #[test]
    fn accepts_uid_inside_data() {
        let input = ProfileCheckInput {
            has_data: true,
            outer_uid: None,
            data_uid: Some("data-uid".to_string()),
            name: Some("Player".to_string()),
            has_hero: true,
            has_item: false,
        };

        assert!(ProfileCheckService::check(&input).is_valid());
        assert_eq!(input.uid(), Some("data-uid"));
    }

    #[test]
    fn reports_all_basic_issues() {
        let input = ProfileCheckInput::default();
        let report = ProfileCheckService::check(&input);

        assert_eq!(
            report.issues,
            [
                ProfileIssue::MissingData,
                ProfileIssue::MissingUid,
                ProfileIssue::MissingName,
                ProfileIssue::MissingHeroAndItem,
            ]
        );
    }

    #[test]
    fn rejects_blank_name_and_uid() {
        let input = ProfileCheckInput {
            has_data: true,
            outer_uid: Some(" ".to_string()),
            data_uid: None,
            name: Some("".to_string()),
            has_hero: true,
            has_item: false,
        };
        let report = ProfileCheckService::check(&input);

        assert_eq!(
            report.issues,
            [ProfileIssue::MissingUid, ProfileIssue::MissingName]
        );
    }
}
