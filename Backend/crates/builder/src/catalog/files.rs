use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
};

pub fn db_dir(project_root: &Path) -> PathBuf {
    project_root.join("Backend/data")
}

pub fn web_root(project_root: &Path) -> PathBuf {
    project_root.join("Frontend/Web")
}

/// Newest `items_en_X_Y_Z.json` and `items_ru_X_Y_Z.json` in `Backend/data`
/// (falls back to 5.1.0 when none is found).
pub fn localized_files(project_root: &Path) -> (PathBuf, PathBuf) {
    (
        latest_localized_file(project_root, "en"),
        latest_localized_file(project_root, "ru"),
    )
}

fn latest_localized_file(project_root: &Path, lang: &str) -> PathBuf {
    let db = db_dir(project_root);
    let prefix = format!("{lang}_");
    let newest = fs::read_dir(&db)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let name = entry.file_name().into_string().ok()?;
            let rest = name.strip_prefix("items_")?.strip_prefix(prefix.as_str())?;
            let version = parse_version(rest.strip_suffix(".json")?)?;
            Some((version, entry.path()))
        })
        .max_by_key(|(version, _)| *version);
    newest.map_or_else(
        || db.join(format!("items_{lang}_5_1_0.json")),
        |(_, path)| path,
    )
}

pub fn latest_plain_items_file(project_root: &Path) -> PathBuf {
    let db = db_dir(project_root);
    let mut best: Option<(PathBuf, (u32, u32, u32))> = None;
    if let Ok(entries) = fs::read_dir(&db) {
        for entry in entries.flatten() {
            let path = entry.path();
            let Some(name) = path.file_name().and_then(|value| value.to_str()) else {
                continue;
            };
            if let Some(version) = plain_items_version(name) {
                if best
                    .as_ref()
                    .is_none_or(|(_, best_version)| version > *best_version)
                {
                    best = Some((path, version));
                }
            }
        }
    }
    best.map(|(path, _)| path)
        .unwrap_or_else(|| db.join("items_5_0_0.json"))
}

pub fn read_items_array(path: &Path) -> Result<Vec<Value>, String> {
    let raw = fs::read_to_string(path)
        .map_err(|err| format!("could not read {}: {err}", path.display()))?;
    let json: Value = serde_json::from_str(&raw)
        .map_err(|err| format!("invalid json {}: {err}", path.display()))?;
    json.as_array()
        .cloned()
        .or_else(|| json.get("items").and_then(Value::as_array).cloned())
        .ok_or_else(|| format!("{} is not an items array/object", path.display()))
}

pub fn plain_items_version(name: &str) -> Option<(u32, u32, u32)> {
    let rest = name.strip_prefix("items_")?.strip_suffix(".json")?;
    if rest.starts_with("en_") || rest.starts_with("ru_") || rest == "tooltips" {
        return None;
    }
    parse_version(rest)
}

/// `X_Y_Z` → `(X, Y, Z)`.
fn parse_version(text: &str) -> Option<(u32, u32, u32)> {
    let parts = text
        .split('_')
        .map(str::parse::<u32>)
        .collect::<Result<Vec<_>, _>>()
        .ok()?;
    match parts.as_slice() {
        [major, minor, patch] => Some((*major, *minor, *patch)),
        _ => None,
    }
}
