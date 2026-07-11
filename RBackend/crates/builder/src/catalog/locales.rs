use crate::catalog::files::{localized_files, read_items_array};
use serde_json::Value;
use std::{collections::BTreeSet, path::Path};

#[derive(Debug, Clone)]
pub struct LocaleCheckReport {
    pub en_items: usize,
    pub ru_items: usize,
    pub shared_items: usize,
}

pub fn check_locales(project_root: &Path) -> Result<LocaleCheckReport, String> {
    let (en_path, ru_path) = localized_files(project_root);
    let en_items = read_items_array(&en_path)?;
    let ru_items = read_items_array(&ru_path)?;
    let en_ids = ids(&en_items);
    let ru_ids = ids(&ru_items);
    let only_en = en_ids.difference(&ru_ids).cloned().collect::<Vec<_>>();
    let only_ru = ru_ids.difference(&en_ids).cloned().collect::<Vec<_>>();

    if !only_en.is_empty() || !only_ru.is_empty() {
        return Err(format!(
            "locale id mismatch: only_en={:?} only_ru={:?}",
            only_en.iter().take(30).collect::<Vec<_>>(),
            only_ru.iter().take(30).collect::<Vec<_>>()
        ));
    }

    Ok(LocaleCheckReport {
        en_items: en_items.len(),
        ru_items: ru_items.len(),
        shared_items: en_ids.len(),
    })
}

fn ids(items: &[Value]) -> BTreeSet<String> {
    items
        .iter()
        .filter_map(|item| item.get("id").and_then(Value::as_str).map(str::to_string))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::check_locales;
    use std::path::Path;

    #[test]
    fn repository_locales_have_same_ids() {
        let root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"));
        let report =
            check_locales(&root).unwrap_or_else(|err| panic!("locales should validate: {err}"));
        assert_eq!(report.en_items, report.ru_items);
        assert!(report.shared_items > 1000);
    }
}
