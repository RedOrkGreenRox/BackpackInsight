use super::{LevelProgress, PlayerLevel, Xp};

const PROFILE_EXP_NEED: &[u64] = &[
    40, 280, 300, 400, 500, 650, 650, 800, 950, 1000, 1050, 1100, 1200, 1300, 1400, 1500, 1600,
    1700, 1800, 1900, 2000, 2150, 2300, 2700, 3000, 4000, 4600, 5400, 6000, 7000, 8000, 9000,
    10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000,
    23000, 24000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000,
    25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000,
    25000, 25000, 25000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000,
    75000, 80000, 85000, 90000, 95000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
    100000, 100000, 100000, 100000,
];

const POST_TABLE_LEVEL_XP: u64 = 100_000;

/// Profile level math, extracted from the current backend into core.
pub struct LevelService;

impl LevelService {
    pub fn from_total_xp(total_xp: Xp) -> LevelProgress {
        let mut remaining = total_xp.0;
        let mut level = 1u64;

        for need in PROFILE_EXP_NEED {
            if remaining >= *need {
                level += 1;
                remaining -= *need;
            } else {
                return LevelProgress {
                    level: PlayerLevel(level),
                    current: Xp(remaining),
                    need: Xp(*need),
                };
            }
        }

        level += remaining / POST_TABLE_LEVEL_XP;
        remaining %= POST_TABLE_LEVEL_XP;

        LevelProgress {
            level: PlayerLevel(level),
            current: Xp(remaining),
            need: Xp(POST_TABLE_LEVEL_XP),
        }
    }

    pub fn exp_table() -> &'static [u64] {
        PROFILE_EXP_NEED
    }
}

#[cfg(test)]
mod tests {
    use super::{LevelService, Xp, POST_TABLE_LEVEL_XP, PROFILE_EXP_NEED};

    #[test]
    fn level_starts_at_one() {
        let progress = LevelService::from_total_xp(Xp(0));
        assert_eq!(progress.level.0, 1);
        assert_eq!(progress.current.0, 0);
        assert_eq!(progress.need.0, 40);
    }

    #[test]
    fn exact_first_level_boundary_matches_python_logic() {
        let progress = LevelService::from_total_xp(Xp(40));
        assert_eq!(progress.level.0, 2);
        assert_eq!(progress.current.0, 0);
        assert_eq!(progress.need.0, 280);
    }

    #[test]
    fn within_level_keeps_current_xp() {
        let progress = LevelService::from_total_xp(Xp(40 + 279));
        assert_eq!(progress.level.0, 2);
        assert_eq!(progress.current.0, 279);
        assert_eq!(progress.need.0, 280);
    }

    #[test]
    fn beyond_table_uses_fixed_post_table_step() {
        let table_total: u64 = PROFILE_EXP_NEED.iter().sum();
        let progress = LevelService::from_total_xp(Xp(table_total + POST_TABLE_LEVEL_XP + 7));
        assert_eq!(progress.level.0, PROFILE_EXP_NEED.len() as u64 + 2);
        assert_eq!(progress.current.0, 7);
        assert_eq!(progress.need.0, POST_TABLE_LEVEL_XP);
    }
}
