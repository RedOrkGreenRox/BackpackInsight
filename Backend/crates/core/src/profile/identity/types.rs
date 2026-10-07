use std::fmt;

/// Stable profile UID selected by profile identity rules.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ProfileUid(String);

impl ProfileUid {
    pub fn new(value: impl Into<String>) -> Option<Self> {
        let value = value.into();
        let trimmed = value.trim();
        (!trimmed.is_empty()).then(|| Self(trimmed.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ProfileUid {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Player-visible profile name.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ProfileName(String);

impl ProfileName {
    pub fn new(value: impl Into<String>) -> Option<Self> {
        let value = value.into();
        let trimmed = value.trim();
        (!trimmed.is_empty()).then(|| Self(trimmed.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ProfileName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Minimal identity input. It can be built from JSON today and FlatBuffers later.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ProfileIdentityInput {
    pub outer_uid: Option<String>,
    pub data_uid: Option<String>,
    pub name: Option<String>,
}

/// Read profile identity.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ProfileIdentity {
    pub uid: ProfileUid,
    pub name: ProfileName,
}

/// Identity read error.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum ProfileIdentityIssue {
    MissingUid,
    MissingName,
}

impl fmt::Display for ProfileIdentityIssue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let value = match self {
            Self::MissingUid => "missing UID in root or Data",
            Self::MissingName => "missing Name",
        };
        f.write_str(value)
    }
}
