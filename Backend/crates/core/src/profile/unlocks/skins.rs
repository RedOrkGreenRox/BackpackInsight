use super::{SkinUnlock, UnlockName};

const SKIN_MARKER: &str = "Skin";

/// Parser for skin unlock strings.
pub struct SkinService;

impl SkinService {
    pub fn parse(unlock: &str) -> Option<SkinUnlock> {
        let marker_index = unlock.find(SKIN_MARKER)?;
        let owner = unlock.get(..marker_index)?;
        let skin = unlock.get(marker_index + SKIN_MARKER.len()..)?;

        Some(SkinUnlock {
            owner: UnlockName::new(owner)?,
            skin: UnlockName::new(skin)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::SkinService;

    #[test]
    fn parses_numbered_skin_regression_case() {
        let Some(skin) = SkinService::parse("NymphedoraSkin02") else {
            panic!("skin should parse");
        };
        assert_eq!(skin.owner.as_str(), "Nymphedora");
        assert_eq!(skin.skin.as_str(), "02");
    }

    #[test]
    fn parses_named_skin() {
        let Some(skin) = SkinService::parse("WarriorSkinGold") else {
            panic!("skin should parse");
        };
        assert_eq!(skin.owner.as_str(), "Warrior");
        assert_eq!(skin.skin.as_str(), "Gold");
    }

    #[test]
    fn rejects_empty_or_non_alphanumeric_parts() {
        assert!(SkinService::parse("Skin02").is_none());
        assert!(SkinService::parse("WarriorSkin").is_none());
        assert!(SkinService::parse("Warrior-Skin02").is_none());
    }
}
