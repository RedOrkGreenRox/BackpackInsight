use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
};

pub fn db_dir(project_root: &Path) -> PathBuf {
    project_root.join("Backend/DB")
}

pub fn web_root(project_root: &Path) -> PathBuf {
    project_root.join("Frontend/Web")
}

pub fn localized_files(project_root: &Path) -> (PathBuf, PathBuf) {
    let db = db_dir(project_root);
    (
        db.join("items_en_5_1_0.json"),
        db.join("items_ru_5_1_0.json"),
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
    let parts = rest
        .split('_')
        .map(str::parse::<u32>)
        .collect::<Result<Vec<_>, _>>()
        .ok()?;
    match parts.as_slice() {
        [major, minor, patch] => Some((*major, *minor, *patch)),
        _ => None,
    }
}
