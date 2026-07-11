use super::{BannerUnlock, UnlockName};

const BANNER_MARKER: &str = "Banner";

/// Parser for banner unlock strings.
pub struct BannerService;

impl BannerService {
    pub fn parse(unlock: &str) -> Option<BannerUnlock> {
        let marker_index = unlock.find(BANNER_MARKER)?;
        let name = unlock.get(..marker_index)?;

        Some(BannerUnlock {
            name: UnlockName::new(name)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::BannerService;

    #[test]
    fn parses_season_banner_like_current_backend() {
        let Some(banner) = BannerService::parse("Season01Banner01") else {
            panic!("banner should parse");
        };
        assert_eq!(banner.name.as_str(), "Season01");
    }

    #[test]
    fn parses_lowercase_banner() {
        let Some(banner) = BannerService::parse("birthdayBanner01") else {
            panic!("banner should parse");
        };
        assert_eq!(banner.name.as_str(), "birthday");
    }

    #[test]
    fn rejects_empty_or_non_alphanumeric_name() {
        assert!(BannerService::parse("Banner01").is_none());
        assert!(BannerService::parse("bad-nameBanner01").is_none());
    }
}
