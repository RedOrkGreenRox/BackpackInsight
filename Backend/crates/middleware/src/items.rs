use pack::{read_api_items_bytes, PackValue};
use serde::Serialize;
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ItemsData {
    pub lang: String,
    pub items: Vec<ItemData>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ItemData {
    pub id: String,
    pub name: String,
    pub rarity: String,
    pub coin_value: Option<i64>,
    pub item_types: Vec<String>,
    pub connected_hero: Option<String>,
    pub unlock_source: Option<String>,
    pub purchasable: bool,
    pub tooltips: Vec<String>,
}

pub fn decode_items(bytes: &[u8]) -> Result<ItemsData, String> {
    let pack = read_api_items_bytes(bytes)?;
    let mut items = Vec::with_capacity(pack.items.len());
    for item in pack.items {
        let object =
            as_object(&item.value).ok_or_else(|| format!("{} is not object", item.item_id))?;
        items.push(ItemData {
            id: string_field(object, "id").unwrap_or(item.item_id),
            name: string_field(object, "name").unwrap_or_default(),
            rarity: string_field(object, "rarity").unwrap_or_default(),
            coin_value: int_field(object, "coinValue"),
            item_types: string_array_field(object, "itemTypes"),
            connected_hero: string_field(object, "connectedHero"),
            unlock_source: string_field(object, "unlockSource"),
            purchasable: bool_field(object, "purchasable").unwrap_or(false),
            tooltips: string_array_field(object, "tooltips"),
        });
    }
    Ok(ItemsData {
        lang: pack.lang,
        items,
    })
}

fn as_object(value: &PackValue) -> Option<&BTreeMap<String, PackValue>> {
    match value {
        PackValue::Object(value) => Some(value),
        _ => None,
    }
}

fn string_field(object: &BTreeMap<String, PackValue>, key: &str) -> Option<String> {
    match object.get(key) {
        Some(PackValue::String(value)) => Some(value.clone()),
        _ => None,
    }
}

fn int_field(object: &BTreeMap<String, PackValue>, key: &str) -> Option<i64> {
    match object.get(key) {
        Some(PackValue::Int(value)) => Some(*value),
        _ => None,
    }
}

fn bool_field(object: &BTreeMap<String, PackValue>, key: &str) -> Option<bool> {
    match object.get(key) {
        Some(PackValue::Bool(value)) => Some(*value),
        _ => None,
    }
}

fn string_array_field(object: &BTreeMap<String, PackValue>, key: &str) -> Vec<String> {
    match object.get(key) {
        Some(PackValue::Array(values)) => values
            .iter()
            .filter_map(|value| match value {
                PackValue::String(value) => Some(value.clone()),
                _ => None,
            })
            .collect(),
        _ => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::decode_items;

    #[test]
    fn rejects_invalid_pack() {
        assert!(decode_items(b"not a pack").is_err());
    }
}
