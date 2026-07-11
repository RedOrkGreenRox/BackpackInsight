use crate::catalog::files::{latest_plain_items_file, read_items_array};
use rbackend_core::SlugService;
use serde_json::Value;
use std::{collections::BTreeSet, path::Path};

#[derive(Debug, Clone)]
pub struct CatalogValidationReport {
    pub items: usize,
    pub recipes_checked: usize,
    pub duplicate_slug_warnings: usize,
}

pub fn validate_catalog(project_root: &Path) -> Result<CatalogValidationReport, String> {
    let source = latest_plain_items_file(project_root);
    let items = read_items_array(&source)?;
    let mut ids = BTreeSet::new();
    let mut slugs = BTreeSet::new();
    let mut errors = Vec::new();
    let mut duplicate_slug_warnings = 0usize;

    for (index, item) in items.iter().enumerate() {
        let Some(id) = item.get("id").and_then(Value::as_str) else {
            errors.push(format!("item[{index}] missing id"));
            continue;
        };
        if !ids.insert(id.to_string()) {
            errors.push(format!("duplicate id: {id}"));
        }

        let name = item.get("name").and_then(Value::as_str).unwrap_or(id);
        let slug = SlugService::to_slug(name).to_string();
        if !slugs.insert(slug) {
            duplicate_slug_warnings += 1;
        }

        if item.get("rarity").and_then(Value::as_str).is_none() {
            errors.push(format!("{id}: missing rarity"));
        }
    }

    let recipes_checked = validate_recipes(&items, &ids, &mut errors);

    if errors.is_empty() {
        Ok(CatalogValidationReport {
            items: items.len(),
            recipes_checked,
            duplicate_slug_warnings,
        })
    } else {
        Err(format_errors("catalog validation failed", &errors))
    }
}

fn validate_recipes(items: &[Value], ids: &BTreeSet<String>, errors: &mut Vec<String>) -> usize {
    let mut checked = 0usize;
    for item in items {
        let owner = item
            .get("id")
            .and_then(Value::as_str)
            .unwrap_or("<unknown>");
        let Some(recipes) = item.get("recipes").and_then(Value::as_array) else {
            continue;
        };
        for recipe in recipes {
            checked += 1;
            if let Some(result_id) = recipe.get("resultId").and_then(Value::as_str) {
                if !ids.contains(result_id) {
                    errors.push(format!("{owner}: recipe resultId not found: {result_id}"));
                }
            }
            if let Some(ingredients) = recipe.get("ingredientIds").and_then(Value::as_array) {
                for ingredient in ingredients.iter().filter_map(Value::as_str) {
                    if !ids.contains(ingredient) {
                        errors.push(format!(
                            "{owner}: recipe ingredientId not found: {ingredient}"
                        ));
                    }
                }
            }
        }
    }
    checked
}

fn format_errors(title: &str, errors: &[String]) -> String {
    let mut out = format!("{title}: {} issue(s)", errors.len());
    for error in errors.iter().take(50) {
        out.push_str("\n- ");
        out.push_str(error);
    }
    if errors.len() > 50 {
        out.push_str(&format!("\n...and {} more", errors.len() - 50));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::validate_catalog;
    use std::path::Path;

    #[test]
    fn validates_repository_plain_catalog() {
        let root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"));
        let report =
            validate_catalog(&root).unwrap_or_else(|err| panic!("catalog should validate: {err}"));
        assert!(report.items > 1000);
        assert!(report.recipes_checked > 0);
        assert!(report.duplicate_slug_warnings > 0);
    }
}
