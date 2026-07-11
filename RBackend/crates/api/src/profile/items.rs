use middleware::decode_items;
use rbackend_core::{Cards, ItemLevel, ItemLevelService, ItemRarity, RarityService};
use serde::Serialize;
use serde_json::Value;
use std::{collections::BTreeMap, fs, path::Path};

#[derive(Debug, Clone, Serialize)]
pub struct ProfileItemView {
    pub name: String,
    pub rarity: String,
    pub level: u32,
    pub cards: u32,
    pub cards_need: i32,
}

#[derive(Debug, Clone)]
pub struct ProfileItemRead {
    pub view: ProfileItemView,
    pub total_xp: u64,
}

#[derive(Debug, Clone)]
struct CatalogItemLite {
    name: String,
    rarity: ItemRarity,
}

pub fn read_items(json: &Value, project_root: &Path) -> Result<Vec<ProfileItemRead>, String> {
    let Some(items) = json.get("Item").and_then(Value::as_object) else {
        return Ok(Vec::new());
    };
    if items.is_empty() {
        return Ok(Vec::new());
    }

    let catalog = catalog_lookup(project_root)?;
    let mut result = Vec::new();

    for (raw_name, raw_value) in items {
        let Some(parsed) = read_item(raw_name, raw_value, &catalog) else {
            continue;
        };
        result.push(parsed);
    }

    Ok(result)
}

pub fn item_stats(items: &[ProfileItemRead]) -> BTreeMap<String, u64> {
    let mut stats = BTreeMap::new();
    for item in items {
        *stats.entry(item.view.rarity.clone()).or_insert(0) += 1;
    }
    stats
}

fn read_item(
    raw_name: &str,
    raw_value: &Value,
    catalog: &BTreeMap<String, CatalogItemLite>,
) -> Option<ProfileItemRead> {
    let raw = raw_value.as_str()?;
    let mut parts = raw.split(':');
    let raw_level = parts.next()?.parse::<u32>().ok()?;
    let cards = parts.next()?.parse::<u32>().ok()?;
    let level = ItemLevel(raw_level.saturating_add(1));
    let catalog_item = catalog.get(raw_name)?;
    let info = ItemLevelService::inspect(catalog_item.rarity, level, Cards(cards));
    let cards_need = info.cards_need.map(|value| value.0 as i32).unwrap_or(-1);

    Some(ProfileItemRead {
        view: ProfileItemView {
            name: catalog_item.name.clone(),
            rarity: catalog_item.rarity.to_string(),
            level: level.0,
            cards,
            cards_need,
        },
        total_xp: info.total_xp.0,
    })
}

fn catalog_lookup(project_root: &Path) -> Result<BTreeMap<String, CatalogItemLite>, String> {
    let bytes = fs::read(project_root.join("RBackend/generated/api_items_en.fb"))
        .map_err(|err| format!("could not read api_items_en.fb: {err}"))?;
    let items = decode_items(&bytes)?;
    let mut lookup = BTreeMap::new();

    for item in items.items {
        let rarity = RarityService::parse(&item.rarity)?;
        let lite = CatalogItemLite {
            name: item.name.clone(),
            rarity,
        };
        lookup.insert(item.id, lite.clone());
        lookup.entry(item.name).or_insert(lite);
    }
    Ok(lookup)
}

#[cfg(test)]
mod tests {
    use super::{item_stats, read_items};
    use serde_json::json;
    use std::path::Path;

    fn repo_root() -> std::path::PathBuf {
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"))
    }

    fn packs_missing(root: &Path) -> bool {
        !root.join("RBackend/generated/api_items_en.fb").exists()
    }

    #[test]
    fn reads_frontend_item_view() {
        let root = repo_root();
        if packs_missing(&root) {
            return;
        }
        let items = read_items(&json!({"Item": {"Wooden Sword": "5:200"}}), &root)
            .unwrap_or_else(|err| panic!("items should read: {err}"));

        assert_eq!(items.len(), 1);
        assert_eq!(items[0].view.name, "Wooden Sword");
        assert_eq!(items[0].view.rarity, "Common");
        assert_eq!(items[0].view.level, 6);
        assert_eq!(items[0].view.cards, 200);
        assert_eq!(items[0].view.cards_need, 100);
        assert_eq!(items[0].total_xp, 190);
    }

    #[test]
    fn skips_unknown_and_malformed_items() {
        let root = repo_root();
        if packs_missing(&root) {
            return;
        }
        let items = read_items(
            &json!({"Item": {"UnknownThing": "1:2", "Wooden Sword": "bad"}}),
            &root,
        )
        .unwrap_or_else(|err| panic!("items should read: {err}"));

        assert!(items.is_empty());
    }

    #[test]
    fn builds_item_stats() {
        let root = repo_root();
        if packs_missing(&root) {
            return;
        }
        let items = read_items(
            &json!({"Item": {"Wooden Sword": "5:200", "Banana": "1:10"}}),
            &root,
        )
        .unwrap_or_else(|err| panic!("items should read: {err}"));
        let stats = item_stats(&items);

        assert_eq!(stats.get("Common"), Some(&2));
    }
}
