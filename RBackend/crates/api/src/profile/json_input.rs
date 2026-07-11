use rbackend_core::{
    ProfileCheckInput, ProfileIdentityInput, ProfileScoreInput, ProfileWalletInput,
};
use serde_json::Value;

pub fn check_input(json: &Value) -> ProfileCheckInput {
    let data = json.get("Data");
    ProfileCheckInput {
        has_data: data.is_some(),
        outer_uid: string_field(json, "UID"),
        data_uid: data.and_then(|value| string_field(value, "UID")),
        name: string_field(json, "Name"),
        has_hero: json.get("Hero").is_some(),
        has_item: json.get("Item").is_some(),
    }
}

pub fn identity_input(json: &Value) -> ProfileIdentityInput {
    let data = json.get("Data");
    ProfileIdentityInput {
        outer_uid: string_field(json, "UID"),
        data_uid: data.and_then(|value| string_field(value, "UID")),
        name: string_field(json, "Name"),
    }
}

pub fn wallet_input(json: &Value) -> ProfileWalletInput {
    let currency = json.get("Currency");
    ProfileWalletInput {
        coins: currency
            .and_then(|value| value.get("coins"))
            .and_then(Value::as_u64),
        gems: currency
            .and_then(|value| value.get("gems"))
            .and_then(Value::as_u64),
    }
}

pub fn score_input(json: &Value) -> ProfileScoreInput {
    ProfileScoreInput {
        trophy: json.get("Trophy").and_then(Value::as_u64),
        bonus_trophy: json.get("BonusTrophy").and_then(Value::as_u64),
    }
}

pub fn unlock_values(json: &Value) -> Vec<&str> {
    json.get("UL")
        .and_then(Value::as_array)
        .map(|values| values.iter().filter_map(Value::as_str).collect())
        .unwrap_or_default()
}

fn string_field(json: &Value, key: &str) -> Option<String> {
    json.get(key).and_then(Value::as_str).map(str::to_string)
}

#[cfg(test)]
mod tests {
    use super::{check_input, identity_input, score_input, unlock_values, wallet_input};
    use serde_json::json;

    #[test]
    fn extracts_profile_inputs_from_json_boundary() {
        let value = json!({
            "Data": {"UID": "data-uid"},
            "UID": "root-uid",
            "Name": "Player",
            "Hero": {},
            "Currency": {"coins": 10, "gems": 2},
            "Trophy": 100,
            "BonusTrophy": 5,
            "UL": ["WarriorSkinGold", 7, "Season01Banner01"]
        });

        assert!(check_input(&value).has_data);
        assert_eq!(identity_input(&value).data_uid.as_deref(), Some("data-uid"));
        assert_eq!(wallet_input(&value).coins, Some(10));
        assert_eq!(wallet_input(&value).gems, Some(2));
        assert_eq!(score_input(&value).bonus_trophy, Some(5));
        assert_eq!(
            unlock_values(&value),
            ["WarriorSkinGold", "Season01Banner01"]
        );
    }
}
