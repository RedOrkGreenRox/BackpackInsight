use crate::profile::{
    catalog_cache::Lang,
    heroes::{read_heroes, ProfileHeroView},
    items::{item_stats, read_items, ProfileItemRecord, ProfileItemView},
    json_input,
};
use rbackend_core::{
    LevelService, ProfileCheckService, ProfileIdentityService, ProfileScoreService,
    ProfileWalletService, UnlockService, Xp,
};
use serde::Serialize;
use serde_json::Value;
use std::collections::BTreeMap;

#[derive(Debug, Clone, Serialize)]
pub struct ProfileViewResponse {
    pub nickname: String,
    pub level: u64,
    pub trophy: u64,
    pub bonus_trophy: u64,
    pub gems: u64,
    pub coins: u64,
    pub xp_current: u64,
    pub xp_need: u64,
    pub area: String,
    pub item_stats: BTreeMap<String, u64>,
    pub heroes: Vec<ProfileHeroView>,
    pub heroes_count: usize,
    pub items: Vec<ProfileItemView>,
    pub items_count: usize,
    /// DB-facing companions to `items`, 1:1 by index. Carries `item_id` (catalog
    /// slug) + `total_xp`. Dropped by `to_pack` (FlatBuffer schema unchanged).
    pub item_records: Vec<ProfileItemRecord>,
    pub actual_version: Option<String>,
    pub install_version: Option<String>,
    pub profile_skins: BTreeMap<String, Vec<String>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProfileErrorResponse {
    pub detail: String,
    pub issues: Vec<String>,
}

pub fn profile_view(
    json: &Value,
    project_root: &std::path::Path,
    lang: Lang,
) -> Result<ProfileViewResponse, ProfileErrorResponse> {
    let check = ProfileCheckService::check(&json_input::check_input(json));
    if !check.is_valid() {
        let issues = check
            .issues
            .iter()
            .map(ToString::to_string)
            .collect::<Vec<_>>();
        return Err(ProfileErrorResponse {
            detail: format!("Failed to process profile: {}", issues.join(", ")),
            issues,
        });
    }

    let identity =
        ProfileIdentityService::read(&json_input::identity_input(json)).map_err(|issues| {
            let issues = issues.iter().map(ToString::to_string).collect::<Vec<_>>();
            ProfileErrorResponse {
                detail: format!("Failed to process profile: {}", issues.join(", ")),
                issues,
            }
        })?;
    let wallet = ProfileWalletService::read(&json_input::wallet_input(json));
    let score = ProfileScoreService::read(&json_input::score_input(json));
    let unlocks = UnlockService::inspect(json_input::unlock_values(json));
    let heroes = read_heroes(json);
    let heroes_count = heroes.len();
    let item_reads = read_items(json, project_root, lang).map_err(|error| ProfileErrorResponse {
        detail: format!("Failed to process profile: {error}"),
        issues: vec![error],
    })?;
    let total_item_xp = item_reads.iter().map(|item| item.total_xp).sum::<u64>();
    let item_stats = item_stats(&item_reads);
    let (items, item_records): (Vec<ProfileItemView>, Vec<ProfileItemRecord>) = item_reads
        .into_iter()
        .map(|item| {
            (
                item.view,
                ProfileItemRecord {
                    item_id: item.item_id,
                    total_xp: item.total_xp,
                },
            )
        })
        .unzip();
    let items_count = items.len();

    let level = LevelService::from_total_xp(Xp(total_item_xp));

    Ok(ProfileViewResponse {
        nickname: identity.name.to_string(),
        level: level.level.0,
        trophy: score.trophy.0,
        bonus_trophy: score.bonus_trophy.0,
        gems: wallet.gems.0,
        coins: wallet.coins.0,
        xp_current: level.current.0,
        xp_need: level.need.0,
        area: score.area.to_string(),
        item_stats,
        heroes,
        heroes_count,
        items,
        items_count,
        item_records,
        actual_version: data_string(json, "AV"),
        install_version: top_string(json, "IV"),
        profile_skins: unlocks.skins,
    })
}

fn data_string(json: &Value, key: &str) -> Option<String> {
    json.get("Data")
        .and_then(|value| value.get(key))
        .and_then(Value::as_str)
        .map(str::to_string)
}

fn top_string(json: &Value, key: &str) -> Option<String> {
    json.get(key).and_then(Value::as_str).map(str::to_string)
}

#[cfg(test)]
mod tests {
    use super::profile_view;
    use crate::profile::catalog_cache::Lang;
    use serde_json::json;
    use std::path::{Path, PathBuf};

    fn repo_root() -> PathBuf {
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"))
    }

    #[test]
    fn builds_minimal_frontend_like_view() {
        let value = json!({
            "Data": {"AV": "5.0.0"},
            "UID": "uid-1",
            "Name": "Player",
            "Item": {},
            "Hero": {"Warrior": "14:3151:3281"},
            "Currency": {"coins": 100, "gems": 5},
            "Trophy": 5000,
            "BonusTrophy": 250,
            "IV": "1.0.0",
            "UL": ["WarriorSkinGold", "NymphedoraSkin02", "Season01Banner01"]
        });
        let Ok(view) = profile_view(&value, &repo_root(), Lang::En) else {
            panic!("view should be valid");
        };

        assert_eq!(view.nickname, "Player");
        assert_eq!(view.coins, 100);
        assert_eq!(view.gems, 5);
        assert_eq!(view.trophy, 5000);
        assert_eq!(view.bonus_trophy, 250);
        assert_eq!(view.area, "14");
        assert_eq!(view.level, 1);
        assert_eq!(view.xp_current, 0);
        assert_eq!(view.xp_need, 40);
        assert_eq!(view.actual_version.as_deref(), Some("5.0.0"));
        assert_eq!(view.install_version.as_deref(), Some("1.0.0"));
        assert_eq!(view.profile_skins["Nymphedora"], ["02"]);
        assert_eq!(view.heroes_count, 1);
        assert_eq!(view.heroes[0].name, "Ronan");
        assert_eq!(view.heroes[0].level, 15);
        assert_eq!(view.heroes[0].league, "Diamond");
        assert!(view.items.is_empty());
        assert_eq!(view.items_count, 0);
    }

    #[test]
    fn builds_items_and_profile_level_from_item_xp() {
        let root = repo_root();
        if !root.join("RBackend/generated/api_items_en.fb").exists() {
            return;
        }
        let value = json!({
            "Data": {"AV": "5.0.0"},
            "UID": "uid-1",
            "Name": "Player",
            "Item": {"Wooden Sword": "5:200"},
            "Currency": {"coins": 0, "gems": 0}
        });
        let Ok(view) = profile_view(&value, &root, Lang::En) else {
            panic!("view should be valid");
        };

        assert_eq!(view.items_count, 1);
        assert_eq!(view.items[0].name, "Wooden Sword");
        assert_eq!(view.items[0].rarity, "Common");
        assert_eq!(view.items[0].level, 6);
        assert_eq!(view.items[0].cards_need, 100);
        assert_eq!(view.item_stats.get("Common"), Some(&1));
        assert_eq!(view.level, 2);
        assert_eq!(view.xp_current, 150);
        assert_eq!(view.xp_need, 280);
    }

    #[test]
    fn invalid_shape_returns_error() {
        let Err(error) = profile_view(&json!({}), &repo_root(), Lang::En) else {
            panic!("view should be invalid");
        };

        assert!(error.detail.contains("Failed to process profile"));
        assert_eq!(error.issues.len(), 4);
    }
}
