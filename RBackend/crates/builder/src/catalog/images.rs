use crate::catalog::files::{latest_plain_items_file, read_items_array, web_root};
use rbackend_core::{ItemIconService, RarityService};
use serde_json::Value;
use std::path::Path;

#[derive(Debug, Clone)]
pub struct ImageCheckReport {
    pub items: usize,
    pub files_checked: usize,
}

pub fn check_images(project_root: &Path) -> Result<ImageCheckReport, String> {
    let source = latest_plain_items_file(project_root);
    let items = read_items_array(&source)?;
    let images_root = web_root(project_root).join("static/images/items");
    let mut missing = Vec::new();
    let mut files_checked = 0usize;

    for item in &items {
        let name = item.get("name").and_then(Value::as_str);
        let id = item.get("id").and_then(Value::as_str);
        let Some(lookup) = name.or(id) else { continue };
        let rarity = item.get("rarity").and_then(Value::as_str);
        if let Some(rarity) = rarity {
            let _ = RarityService::parse(rarity);
        }
        let first_tooltip = item
            .get("tooltips")
            .and_then(Value::as_array)
            .and_then(|values| values.first())
            .and_then(Value::as_str);
        let key = ItemIconService::image_key(lookup, rarity, first_tooltip);

        for format in ["webp", "avif"] {
            files_checked += 1;
            let expected = images_root.join(format).join(format!("{key}.{format}"));
            if expected.exists() {
                continue;
            }
            // Fallback: try by id if name didn't match (files may be renamed to id).
            if let Some(id) = id {
                if id != lookup {
                    let id_key = ItemIconService::image_key(id, rarity, first_tooltip);
                    let alt = images_root.join(format).join(format!("{id_key}.{format}"));
                    if alt.exists() {
                        continue;
                    }
                }
            }
            missing.push(format!("[{format}] {}: {}", name.or(id).unwrap_or("?"), expected.display()));
        }
    }

    if missing.is_empty() {
        Ok(ImageCheckReport {
            items: items.len(),
            files_checked,
        })
    } else {
        Err(format_errors("image validation failed", &missing))
    }
}

fn format_errors(title: &str, errors: &[String]) -> String {
    let mut out = format!("{title}: {} issue(s)", errors.len());
    for error in errors.iter().take(100) {
        out.push_str("\n- ");
        out.push_str(error);
    }
    if errors.len() > 100 {
        out.push_str(&format!("\n...and {} more", errors.len() - 100));
    }
    out
}
