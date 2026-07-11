use crate::catalog::files::{latest_plain_items_file, read_items_array};
use rbackend_core::{ItemIconService, RarityService, SlugService};
use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

const CATALOG_SCHEMA: &str = "RBackend/schemas/catalog.fbs";
const CATALOG_JSON: &str = "catalog_summary.json";
const CATALOG_BIN: &str = "catalog_summary.bin";
const CATALOG_FB: &str = "catalog_summary.fb";
#[derive(Debug, Serialize)]
struct PackHeaderJson {
    schema_version: String,
    game_version: String,
    build_hash: String,
}

#[derive(Debug, Serialize)]
struct ItemSummaryJson {
    row: usize,
    item_id: String,
    name: String,
    slug: String,
    image_key: String,
    rarity: String,
}

#[derive(Debug, Serialize)]
struct CatalogSummaryJson {
    header: PackHeaderJson,
    items: Vec<ItemSummaryJson>,
}

pub fn build_catalog_flatbuffer(project_root: &Path) -> Result<PathBuf, String> {
    let generated_dir = project_root.join("RBackend/generated");
    fs::create_dir_all(&generated_dir)
        .map_err(|err| format!("could not create {}: {err}", generated_dir.display()))?;

    let json_path = generated_dir.join(CATALOG_JSON);
    let bin_path = generated_dir.join(CATALOG_BIN);
    let fb_path = generated_dir.join(CATALOG_FB);
    write_catalog_flatbuffer_json(project_root, &json_path)?;

    let schema_path = project_root.join(CATALOG_SCHEMA);
    let output = Command::new("flatc")
        .arg("-b")
        .arg("-o")
        .arg(&generated_dir)
        .arg(&schema_path)
        .arg(&json_path)
        .output()
        .map_err(|err| format!("could not run flatc: {err}. Install flatbuffers-compiler."));
    let cleanup_result = remove_temp_json(&json_path);
    let output = output?;
    cleanup_result?;

    if !output.status.success() {
        return Err(format!(
            "flatc failed with status {}\nstdout:\n{}\nstderr:\n{}",
            output.status,
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    if !bin_path.exists() {
        return Err(format!(
            "flatc did not create expected output {}",
            bin_path.display()
        ));
    }

    if fb_path.exists() {
        fs::remove_file(&fb_path)
            .map_err(|err| format!("could not replace {}: {err}", fb_path.display()))?;
    }
    fs::rename(&bin_path, &fb_path).map_err(|err| {
        format!(
            "could not rename {} to {}: {err}",
            bin_path.display(),
            fb_path.display()
        )
    })?;

    pack::read_catalog_summary(&fb_path).map_err(|err| format!("FlatBuffer read failed: {err}"))?;
    Ok(fb_path)
}

fn remove_temp_json(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    fs::remove_file(path)
        .map_err(|err| format!("could not remove temporary {}: {err}", path.display()))
}

pub fn verify_flatbuffer(
    project_root: &Path,
    path: Option<PathBuf>,
) -> Result<pack::CatalogPackInfo, String> {
    let path = path.unwrap_or_else(|| project_root.join("RBackend/generated").join(CATALOG_FB));
    pack::read_catalog_summary(&path)
}

fn write_catalog_flatbuffer_json(project_root: &Path, out_path: &Path) -> Result<(), String> {
    let source = latest_plain_items_file(project_root);
    let items = read_items_array(&source)?;
    let mut summaries = Vec::with_capacity(items.len());

    for (row, item) in items.iter().enumerate() {
        let item_id = item
            .get("id")
            .and_then(Value::as_str)
            .ok_or_else(|| format!("item[{row}] missing id"))?;
        let name = item.get("name").and_then(Value::as_str).unwrap_or(item_id);
        let rarity = item
            .get("rarity")
            .and_then(Value::as_str)
            .unwrap_or("Common");
        RarityService::parse(rarity)?;
        let first_tooltip = item
            .get("tooltips")
            .and_then(Value::as_array)
            .and_then(|values| values.first())
            .and_then(Value::as_str);

        summaries.push(ItemSummaryJson {
            row,
            item_id: item_id.to_string(),
            name: name.to_string(),
            slug: SlugService::to_slug(name).to_string(),
            image_key: ItemIconService::image_key(name, Some(rarity), first_tooltip).to_string(),
            rarity: rarity.to_string(),
        });
    }

    let pack = CatalogSummaryJson {
        header: PackHeaderJson {
            schema_version: "catalog.fbs@0".to_string(),
            game_version: source
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("items_unknown")
                .to_string(),
            build_hash: "dev".to_string(),
        },
        items: summaries,
    };

    let text = serde_json::to_string_pretty(&pack).map_err(|err| err.to_string())?;
    fs::write(out_path, text)
        .map_err(|err| format!("could not write {}: {err}", out_path.display()))
}
