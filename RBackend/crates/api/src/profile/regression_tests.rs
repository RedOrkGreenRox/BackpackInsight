//! Регрессионный тест на ingestion 13 реальных игровых профилей.
//! Паритет с Python `tests/test_profiles_integration.py`.

use super::view::profile_view;
use crate::profile::catalog_cache::Lang;
use rbackend_core::HeroNameService;
use serde_json::Value;
use std::path::{Path, PathBuf};

const KNOWN_RAW_HERO_NAMES: &[&str] = &[
    "Barbarian", "Elementalist", "Warrior", "Marksman", "Engineer", "Beekeeper",
    "Hob", "Dorf", "Pepper", "Celeste", "Morrow", "Sage", "Enoch", "Buzz",
    "Chana", "Harkon", "Nymphedora", "Ronan", "Tink",
];

fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../..")
        .canonicalize()
        .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"))
}

fn profiles_dir() -> PathBuf {
    repo_root().join("tests/fixtures/profiles")
}

fn packs_missing(root: &Path) -> bool {
    !root.join("RBackend/generated/api_items_en.fb").exists()
}

fn load_profile(path: &Path) -> Value {
    let raw = std::fs::read_to_string(path)
        .unwrap_or_else(|err| panic!("read {}: {err}", path.display()));
    let raw = raw.strip_prefix('\u{feff}').unwrap_or(&raw);
    serde_json::from_str::<Value>(raw)
        .unwrap_or_else(|err| panic!("parse JSON {}: {err}", path.display()))
}

fn raw_item_count(json: &Value) -> usize {
    json.get("Item")
        .and_then(Value::as_object)
        .map(|map| map.len())
        .unwrap_or(0)
}

fn raw_hero_count(json: &Value) -> usize {
    json.get("Hero")
        .and_then(Value::as_object)
        .map(|map| map.len())
        .unwrap_or(0)
}

fn is_known_hero(normalized_name: &str) -> bool {
    KNOWN_RAW_HERO_NAMES.iter().any(|known| {
        let raw = *known;
        HeroNameService::normalize(raw).as_str() == normalized_name || raw == normalized_name
    })
}

#[test]
fn ingests_all_real_profiles_without_errors() {
    let root = repo_root();
    if packs_missing(&root) {
        eprintln!(
            "[SKIP] real-profile regression: api_items_en.fb not built. \
             Run `cargo run -p builder -- build-all-packs` to enable."
        );
        return;
    }
    let dir = profiles_dir();
    if !dir.is_dir() {
        eprintln!(
            "[SKIP] real-profile regression: tests/fixtures/profiles/ not found at {}. \
             In Docker, ensure `COPY tests /src/tests` is in the Dockerfile.",
            dir.display()
        );
        return;
    }
    let mut entries = std::fs::read_dir(&dir)
        .unwrap_or_else(|err| panic!("read_dir {}: {err}", dir.display()))
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.extension().is_some_and(|ext| ext == "json"))
        .collect::<Vec<_>>();
    entries.sort();
    assert_eq!(
        entries.len(),
        13,
        "expected exactly 13 real profile fixtures (parity with Python test_profiles_integration.py)"
    );
    let mut total_unknown_heroes = 0usize;
    let mut total_unknown_items = 0usize;
    for path in &entries {
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("?");
        let json = load_profile(path);
        let view = match profile_view(&json, &root, Lang::En) {
            Ok(view) => view,
            Err(error) => panic!(
                "[FAIL] {name}: profile_view returned error: {} | issues={:?}",
                error.detail, error.issues
            ),
        };
        assert!(
            view.heroes_count > 0 || view.items_count > 0,
            "[FAIL] {name}: no heroes and no items recognized"
        );
        let raw_heroes = raw_hero_count(&json);
        for hero in &view.heroes {
            if !is_known_hero(&hero.name) {
                total_unknown_heroes += 1;
                eprintln!("  [WARN] {name}: unknown hero name after normalize: {:?}", hero.name);
            }
        }
        if view.heroes_count < raw_heroes {
            eprintln!(
                "  [WARN] {name}: recognized {} of {} hero entries",
                view.heroes_count, raw_heroes
            );
        }
        let raw_items = raw_item_count(&json);
        if view.items_count < raw_items {
            let missing = raw_items - view.items_count;
            total_unknown_items += missing;
            eprintln!(
                "  [WARN] {name}: {} of {} item definitions missing (recognized {})",
                missing, raw_items, view.items_count
            );
        }
        assert!(!view.nickname.is_empty(), "[FAIL] {name}: nickname is empty");
        assert!(view.level >= 1, "[FAIL] {name}: level < 1 (got {})", view.level);
        assert!(!view.area.is_empty(), "[FAIL] {name}: area is empty");
        eprintln!(
            "  [OK] {name}: heroes={} items={} level={} area={} trophies={}+{}",
            view.heroes_count, view.items_count, view.level, view.area, view.trophy, view.bonus_trophy
        );
    }
    eprintln!(
        "real-profile regression: 13/13 ingested. unknown_heroes={total_unknown_heroes} unknown_items={total_unknown_items}"
    );
}
