use super::PlayerArea;

const PROFILE_AREAS: &[u64] = &[
    0, 5, 50, 100, 200, 300, 400, 500, 700, 1000, 1600, 2300, 3500, 4800, 6500, 8500, 12000, 16000,
    22000, 30000,
];

/// Trophy-to-area math, extracted from current backend rules.
pub struct AreaService;

impl AreaService {
    pub fn from_trophies(trophy: u64, bonus_trophy: u64) -> PlayerArea {
        let total = trophy.saturating_add(bonus_trophy);

        for (index, requirement) in PROFILE_AREAS.iter().enumerate() {
            if total < *requirement {
                return PlayerArea(index as u8);
            }
        }

        PlayerArea(20)
    }

    pub fn area_table() -> &'static [u64] {
        PROFILE_AREAS
    }
}

#[cfg(test)]
mod tests {
    use super::AreaService;

    #[test]
    fn area_boundaries_match_current_backend_logic() {
        assert_eq!(AreaService::from_trophies(0, 0).code(), "01");
        assert_eq!(AreaService::from_trophies(4, 0).code(), "01");
        assert_eq!(AreaService::from_trophies(5, 0).code(), "02");
        assert_eq!(AreaService::from_trophies(29_999, 0).code(), "19");
        assert_eq!(AreaService::from_trophies(30_000, 0).code(), "20");
    }

    #[test]
    fn bonus_trophy_is_included() {
        assert_eq!(AreaService::from_trophies(29_000, 999).code(), "19");
        assert_eq!(AreaService::from_trophies(29_000, 1_000).code(), "20");
    }
}
