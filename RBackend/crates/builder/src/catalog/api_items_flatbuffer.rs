use crate::catalog::files::{localized_files, read_items_array};
use serde_json::{json, Map, Value};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    process::Command,
};

const API_ITEMS_SCHEMA: &str = "RBackend/schemas/api_items.fbs";
const API_ITEMS_FILE_IDENTIFIER: &[u8; 4] = b"BIAI";

pub fn build_api_items_flatbuffers(project_root: &Path) -> Result<Vec<PathBuf>, String> {
    let generated_dir = project_root.join("RBackend/generated");
    fs::create_dir_all(&generated_dir)
        .map_err(|err| format!("could not create {}: {err}", generated_dir.display()))?;

    let mut outputs = Vec::new();
    for lang in ["en", "ru"] {
        let json_path = generated_dir.join(format!("api_items_{lang}.json"));
        let bin_path = generated_dir.join(format!("api_items_{lang}.bin"));
        let fb_path = generated_dir.join(format!("api_items_{lang}.fb"));
        write_api_items_json(project_root, lang, &json_path)?;
        let flatc_result = run_flatc(project_root, &generated_dir, &json_path);
        let cleanup_result = remove_temp_json(&json_path);
        flatc_result?;
        cleanup_result?;
        if !bin_path.exists() {
            return Err(format!("flatc did not create {}", bin_path.display()));
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
        verify_api_items_file(&fb_path)?;
        outputs.push(fb_path);
    }

    Ok(outputs)
}

pub fn verify_api_items_flatbuffers(
    project_root: &Path,
) -> Result<Vec<pack::ApiItemsPackInfo>, String> {
    let generated_dir = project_root.join("RBackend/generated");
    ["en", "ru"]
        .into_iter()
        .map(|lang| {
            let path = generated_dir.join(format!("api_items_{lang}.fb"));
            pack::read_api_items(&path)
        })
        .collect()
}

fn write_api_items_json(project_root: &Path, lang: &str, out_path: &Path) -> Result<(), String> {
    let mut items = merged_items(project_root)?;
    apply_language(&mut items, lang);
    let pack = json!({
        "schema_version": "api_items.fbs@1",
        "lang": lang,
        "items": items
            .into_iter()
            .filter_map(|item| {
                let item_id = item.get("id")?.as_str()?.to_string();
                Some(json!({"item_id": item_id, "value": json_to_pack_value(&item)}))
            })
            .collect::<Vec<_>>()
    });
    let text = serde_json::to_string_pretty(&pack).map_err(|err| err.to_string())?;
    fs::write(out_path, text)
        .map_err(|err| format!("could not write {}: {err}", out_path.display()))
}

fn merged_items(project_root: &Path) -> Result<Vec<Value>, String> {
    let (en_path, ru_path) = localized_files(project_root);
    let en_items = read_items_array(&en_path)?;
    let ru_items = read_items_array(&ru_path)?;
    let mut merged = Vec::with_capacity(en_items.len());
    let mut positions = HashMap::<String, usize>::new();

    for item in en_items {
        let Some(item_id) = item_id(&item).map(str::to_string) else {
            continue;
        };
        let localized = with_localization(item, "en", None);
        positions.insert(item_id, merged.len());
        merged.push(localized);
    }

    for item in ru_items {
        let Some(item_id) = item_id(&item).map(str::to_string) else {
            continue;
        };
        if let Some(index) = positions.get(&item_id).copied() {
            merge_ru_localization(&mut merged[index], &item);
        } else {
            let index = merged.len();
            merged.push(with_localization(item, "ru", None));
            positions.insert(item_id, index);
        }
    }

    Ok(merged)
}

fn with_localization(mut item: Value, primary_lang: &str, mirror_lang: Option<&str>) -> Value {
    let name = item
        .get("name")
        .and_then(Value::as_str)
        .unwrap_or("Unknown")
        .to_string();
    let tooltips = item.get("tooltips").cloned().unwrap_or_else(|| json!([]));

    if let Some(object) = item.as_object_mut() {
        let mut names = Map::new();
        names.insert(primary_lang.to_string(), Value::String(name.clone()));
        if let Some(mirror_lang) = mirror_lang {
            names.insert(mirror_lang.to_string(), Value::String(name));
        }
        object.insert("names_local".to_string(), Value::Object(names));

        let mut tips = Map::new();
        tips.insert(primary_lang.to_string(), tooltips.clone());
        if let Some(mirror_lang) = mirror_lang {
            tips.insert(mirror_lang.to_string(), tooltips);
        }
        object.insert("tooltips_local".to_string(), Value::Object(tips));
        object.remove("embargoed");
    }

    item
}

fn merge_ru_localization(target: &mut Value, ru_item: &Value) {
    let ru_name = ru_item.get("name").and_then(Value::as_str);
    let ru_tooltips = ru_item
        .get("tooltips")
        .cloned()
        .unwrap_or_else(|| json!([]));
    if let Some(object) = target.as_object_mut() {
        if let Some(ru_name) = ru_name {
            set_localized_field(
                object,
                "names_local",
                "ru",
                Value::String(ru_name.to_string()),
            );
        }
        set_localized_field(object, "tooltips_local", "ru", ru_tooltips);
    }
}

fn set_localized_field(object: &mut Map<String, Value>, field: &str, lang: &str, value: Value) {
    let entry = object
        .entry(field.to_string())
        .or_insert_with(|| Value::Object(Map::new()));
    if !entry.is_object() {
        *entry = Value::Object(Map::new());
    }
    if let Some(map) = entry.as_object_mut() {
        map.insert(lang.to_string(), value);
    }
}

fn apply_language(items: &mut [Value], lang: &str) {
    for item in items {
        let localized_name = item
            .get("names_local")
            .and_then(|value| value.get(lang))
            .and_then(Value::as_str)
            .map(str::to_string);
        let localized_tooltips = item
            .get("tooltips_local")
            .and_then(|value| value.get(lang))
            .cloned();
        if let Some(object) = item.as_object_mut() {
            if let Some(name) = localized_name {
                object.insert("name".to_string(), Value::String(name));
            }
            if let Some(tooltips) = localized_tooltips {
                object.insert("tooltips".to_string(), tooltips);
            }
        }
    }
}

fn item_id(item: &Value) -> Option<&str> {
    item.get("id").and_then(Value::as_str)
}

fn json_to_pack_value(value: &Value) -> Value {
    match value {
        Value::Null => json!({"kind": "Null"}),
        Value::Bool(value) => json!({"kind": "Bool", "bool_value": value}),
        Value::Number(value) => {
            if let Some(int_value) = value.as_i64() {
                json!({"kind": "Int", "int_value": int_value})
            } else if let Some(uint_value) = value.as_u64() {
                let int_value = i64::try_from(uint_value).unwrap_or(i64::MAX);
                json!({"kind": "Int", "int_value": int_value})
            } else {
                json!({"kind": "Float", "float_value": value.as_f64().unwrap_or(0.0)})
            }
        }
        Value::String(value) => json!({"kind": "String", "string_value": value}),
        Value::Array(values) => json!({
            "kind": "Array",
            "array_value": values.iter().map(json_to_pack_value).collect::<Vec<_>>()
        }),
        Value::Object(values) => json!({
            "kind": "Object",
            "object_value": values
                .iter()
                .map(|(key, value)| json!({"key": key, "value": json_to_pack_value(value)}))
                .collect::<Vec<_>>()
        }),
    }
}

fn remove_temp_json(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    fs::remove_file(path)
        .map_err(|err| format!("could not remove temporary {}: {err}", path.display()))
}

fn run_flatc(project_root: &Path, output_dir: &Path, json_path: &Path) -> Result<(), String> {
    let schema_path = project_root.join(API_ITEMS_SCHEMA);
    let output = Command::new("flatc")
        .arg("-b")
        .arg("-o")
        .arg(output_dir)
        .arg(schema_path)
        .arg(json_path)
        .output()
        .map_err(|err| format!("could not run flatc: {err}. Install flatbuffers-compiler."))?;
    if output.status.success() {
        Ok(())
    } else {
        Err(format!(
            "flatc failed with status {}\nstdout:\n{}\nstderr:\n{}",
            output.status,
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

fn verify_api_items_file(path: &Path) -> Result<(), String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    if bytes.len() < 8 {
        return Err(format!("{} is too small", path.display()));
    }
    if &bytes[4..8] != API_ITEMS_FILE_IDENTIFIER {
        return Err(format!("{} has wrong identifier", path.display()));
    }
    Ok(())
}
