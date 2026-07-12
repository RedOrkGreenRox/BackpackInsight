//! In-memory кеш каталога предметов с поддержкой локали.
//!
//! `api_items_{en,ru}.fb` иммутабельны внутри Docker-образа (генерируются
//! на build-time через `builder build-all-packs`), поэтому инвалидация не нужна.

use middleware::decode_items;
use rbackend_core::{ItemRarity, RarityService};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

#[derive(Debug, Clone)]
pub struct CatalogItemLite {
    pub item_id: String,
    pub name: String,
    pub rarity: ItemRarity,
}

pub type CatalogLookup = BTreeMap<String, CatalogItemLite>;

static CATALOG_EN: OnceLock<CatalogLookup> = OnceLock::new();
static CATALOG_RU: OnceLock<CatalogLookup> = OnceLock::new();
static PROJECT_ROOT: OnceLock<PathBuf> = OnceLock::new();

pub fn catalog_lookup(
    project_root: &Path,
    lang: Lang,
) -> Result<&'static CatalogLookup, String> {
    let _ = PROJECT_ROOT.set(project_root.to_path_buf());
    match lang {
        Lang::Ru => get_or_build(&CATALOG_RU, || build_lookup(project_root, Lang::Ru)),
        Lang::En => get_or_build(&CATALOG_EN, || build_lookup(project_root, Lang::En)),
    }
}

fn get_or_build(
    cell: &'static OnceLock<CatalogLookup>,
    build: impl FnOnce() -> Result<CatalogLookup, String>,
) -> Result<&'static CatalogLookup, String> {
    if let Some(existing) = cell.get() {
        return Ok(existing);
    }
    let built = build()?;
    let _ = cell.set(built);
    cell.get()
        .ok_or_else(|| "catalog cache init failed unexpectedly".to_string())
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Lang {
    En,
    Ru,
}

pub fn normalize_lang(lang: &str) -> Lang {
    match lang.to_ascii_lowercase().as_str() {
        "ru" | "rus" | "russian" => Lang::Ru,
        _ => Lang::En,
    }
}

fn build_lookup(project_root: &Path, lang: Lang) -> Result<CatalogLookup, String> {
    let file_name = match lang {
        Lang::En => "api_items_en.fb",
        Lang::Ru => "api_items_ru.fb",
    };
    let path = project_root.join("RBackend/generated").join(file_name);
    let bytes = std::fs::read(&path)
        .map_err(|err| format!("could not read {file_name} at {}: {err}", path.display()))?;
    let items = decode_items(&bytes)?;
    let mut lookup = BTreeMap::new();
    for item in items.items {
        let rarity = RarityService::parse(&item.rarity)?;
        let lite = CatalogItemLite {
            item_id: item.id.clone(),
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
    use super::{catalog_lookup, normalize_lang, Lang};
    use std::path::{Path, PathBuf};

    fn repo_root() -> PathBuf {
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../..")
            .canonicalize()
            .unwrap_or_else(|err| panic!("workspace root should resolve: {err}"))
    }

    fn packs_missing(root: &Path) -> bool {
        !root.join("RBackend/generated/api_items_en.fb").exists()
    }

    #[test]
    fn normalize_lang_accepts_common_forms() {
        assert_eq!(normalize_lang("en"), Lang::En);
        assert_eq!(normalize_lang("EN"), Lang::En);
        assert_eq!(normalize_lang("ru"), Lang::Ru);
        assert_eq!(normalize_lang("RU"), Lang::Ru);
        assert_eq!(normalize_lang("rus"), Lang::Ru);
        assert_eq!(normalize_lang("russian"), Lang::Ru);
        assert_eq!(normalize_lang("de"), Lang::En);
        assert_eq!(normalize_lang(""), Lang::En);
    }

    #[test]
    fn catalog_lookup_returns_cached_reference_on_second_call() {
        let root = repo_root();
        if packs_missing(&root) {
            return;
        }
        let first = catalog_lookup(&root, Lang::En)
            .unwrap_or_else(|err| panic!("en lookup should build: {err}"));
        let second = catalog_lookup(&root, Lang::En)
            .unwrap_or_else(|err| panic!("en lookup should be cached: {err}"));
        assert!(std::ptr::eq(first, second));
    }

    #[test]
    fn catalog_lookup_ru_and_en_are_independent() {
        let root = repo_root();
        if packs_missing(&root) {
            return;
        }
        let en = catalog_lookup(&root, Lang::En).unwrap_or_else(|err| panic!("en lookup: {err}"));
        let ru = catalog_lookup(&root, Lang::Ru).unwrap_or_else(|err| panic!("ru lookup: {err}"));
        assert!(!std::ptr::eq(en, ru), "en and ru caches must be distinct");
        assert!(!en.is_empty(), "en catalog should have items");
        assert!(!ru.is_empty(), "ru catalog should have items");
    }
}
