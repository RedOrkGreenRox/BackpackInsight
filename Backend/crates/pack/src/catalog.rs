use crate::generated::catalog_generated::backpack_insight::catalog::{
    catalog_summary_pack_buffer_has_identifier, root_as_catalog_summary_pack,
};
use serde::Serialize;
use std::{fs, path::Path};

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CatalogPackItem {
    pub row: u32,
    pub item_id: String,
    pub name: String,
    pub slug: String,
    pub image_key: String,
    pub rarity: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CatalogPackInfo {
    pub schema_version: String,
    pub game_version: Option<String>,
    pub build_hash: Option<String>,
    pub items: usize,
    pub first: Option<CatalogPackItem>,
}

pub fn read_catalog_summary(path: &Path) -> Result<CatalogPackInfo, String> {
    let bytes =
        fs::read(path).map_err(|err| format!("could not read {}: {err}", path.display()))?;
    read_catalog_summary_bytes(&bytes)
}

pub fn read_catalog_summary_bytes(bytes: &[u8]) -> Result<CatalogPackInfo, String> {
    if !catalog_summary_pack_buffer_has_identifier(bytes) {
        return Err("catalog summary FlatBuffer has wrong identifier".to_string());
    }

    let pack = root_as_catalog_summary_pack(bytes).map_err(|err| err.to_string())?;
    let header = pack.header();
    let items = pack.items();
    let first = (!items.is_empty()).then(|| {
        let item = items.get(0);
        CatalogPackItem {
            row: item.row(),
            item_id: item.item_id().to_string(),
            name: item.name().to_string(),
            slug: item.slug().to_string(),
            image_key: item.image_key().to_string(),
            rarity: item
                .rarity()
                .variant_name()
                .unwrap_or("<unknown>")
                .to_string(),
        }
    });

    Ok(CatalogPackInfo {
        schema_version: header.schema_version().to_string(),
        game_version: header.game_version().map(str::to_string),
        build_hash: header.build_hash().map(str::to_string),
        items: items.len(),
        first,
    })
}

#[cfg(test)]
mod tests {
    use super::read_catalog_summary_bytes;

    #[test]
    fn rejects_non_flatbuffer_bytes() {
        assert!(read_catalog_summary_bytes(b"not a flatbuffer").is_err());
    }
}
