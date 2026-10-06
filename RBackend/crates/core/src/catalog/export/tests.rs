//! Тесты модели экспорта: настоящие файлы 5.1.0 и отказ на чужих данных.

use super::{CatalogExport, ExportError};
use crate::ItemRarity;
use std::path::PathBuf;

fn source(lang: &str) -> Vec<u8> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join(format!("../../../Backend/DB/items_{lang}_5_1_0.json"));
    std::fs::read(&path).unwrap_or_else(|err| panic!("{}: {err}", path.display()))
}

#[test]
fn real_exports_parse_and_round_trip() {
    for lang in ["en", "ru"] {
        let export = CatalogExport::parse(&source(lang)).unwrap_or_else(|err| panic!("{err}"));
        assert_eq!(export.items.len(), 1038, "{lang}");
        let json = serde_json::to_vec(&export).unwrap_or_else(|err| panic!("{err}"));
        let again = CatalogExport::parse(&json).unwrap_or_else(|err| panic!("{err}"));
        assert_eq!(again, export, "{lang}");
    }
}

#[test]
fn known_item_is_typed() {
    let export = CatalogExport::parse(&source("en")).unwrap_or_else(|err| panic!("{err}"));
    let item = export
        .items
        .iter()
        .find(|item| item.id == "Abyssal Embrace");
    let item = item.unwrap_or_else(|| panic!("Abyssal Embrace missing"));
    assert_eq!(item.rarity, ItemRarity::Mythic);
    assert_eq!(item.item_shape.len(), 6);
    assert_eq!(item.combat_stats.cooldown, Some(4.6));
    assert_eq!(item.levels.max_level, 14);
}

fn minimal(item_count: usize, rarity: &str, extra: &str) -> String {
    format!(
        r#"{{"appVersion":"5.1.0","buildNumber":"1","exportDate":"d","language":"en",
        "embargoed":false,"itemCount":{item_count},"items":[{{"id":"A","name":"A",
        "rarity":"{rarity}","coinValue":1,"itemTypes":[],"connectedHero":"Shared",
        "unlockSource":"Default","itemShape":[{{"x":0,"y":0}}],"itemStars":[],
        "purchasable":true,"embargoed":false,"recipes":[],"combatStats":{{"damageMin":null,
        "damageMax":null,"accuracy":null,"staminaCost":null,"cooldown":null,
        "criticalChance":null,"criticalDamage":null}},"tooltips":[],"allStats":{{}},
        "levels":{{"maxLevel":1,"chancePerLevel":null,"baseChance":null,
        "chanceBreakpointBonus":null,"abilityDescription":null,"changes":[]}}{extra}}}]}}"#
    )
}

#[test]
fn minimal_export_parses() {
    assert!(CatalogExport::parse(minimal(1, "Rare", "").as_bytes()).is_ok());
}

#[test]
fn fields_added_in_7_0_are_known() {
    let extra = r#","embargoCode":"Season7","absorbEffect":["Gain 2 Luck"]"#;
    let export = CatalogExport::parse(minimal(1, "Rare", extra).as_bytes());
    let export = export.unwrap_or_else(|err| panic!("{err}"));
    let item = &export.items[0];
    assert_eq!(item.embargo_code.as_deref(), Some("Season7"));
    assert_eq!(
        item.absorb_effect.as_deref(),
        Some(&["Gain 2 Luck".to_string()][..])
    );
}

#[test]
fn rejects_unknown_rarity_field_and_count() {
    let unknown_rarity = CatalogExport::parse(minimal(1, "Godly", "").as_bytes());
    assert!(matches!(unknown_rarity, Err(ExportError::Json(_))));
    let unknown_field = CatalogExport::parse(minimal(1, "Rare", r#","new":1"#).as_bytes());
    assert!(matches!(unknown_field, Err(ExportError::Json(_))));
    let wrong_count = CatalogExport::parse(minimal(2, "Rare", "").as_bytes());
    assert!(matches!(
        wrong_count,
        Err(ExportError::Count {
            declared: 2,
            actual: 1
        })
    ));
}
