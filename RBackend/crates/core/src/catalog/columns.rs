use super::{ItemId, StringId, StringPool};
use crate::{ItemIconService, ItemRarity, SlugService};

/// Minimal input for one catalog row.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CatalogItemInput {
    pub item_id: String,
    pub name: String,
    pub rarity: ItemRarity,
    pub first_tooltip: Option<String>,
}

/// First data-oriented catalog skeleton.
///
/// This is intentionally small. It stores the first columns needed by routes,
/// image lookup, and future search/index generation.
#[derive(Debug, Clone, Default)]
pub struct CatalogColumns {
    strings: StringPool,
    item_ids: Vec<StringId>,
    names: Vec<StringId>,
    slugs: Vec<StringId>,
    image_keys: Vec<StringId>,
    rarities: Vec<ItemRarity>,
}

impl CatalogColumns {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push(&mut self, input: CatalogItemInput) -> ItemId {
        let row = ItemId::new(self.names.len() as u32);
        let item_id = self.strings.intern(input.item_id);
        let name = self.strings.intern(&input.name);
        let slug = self
            .strings
            .intern(SlugService::to_slug(input.name.as_str()).to_string());
        let image_key = self.strings.intern(
            ItemIconService::image_key(
                input.name.as_str(),
                Some(input.rarity.as_str()),
                input.first_tooltip.as_deref(),
            )
            .to_string(),
        );

        self.item_ids.push(item_id);
        self.names.push(name);
        self.slugs.push(slug);
        self.image_keys.push(image_key);
        self.rarities.push(input.rarity);

        row
    }

    pub fn len(&self) -> usize {
        self.names.len()
    }

    pub fn is_empty(&self) -> bool {
        self.names.is_empty()
    }

    pub fn string_count(&self) -> usize {
        self.strings.len()
    }

    pub fn item_id(&self, row: ItemId) -> Option<&str> {
        self.item_ids
            .get(row.index())
            .and_then(|id| self.strings.get(*id))
    }

    pub fn name(&self, row: ItemId) -> Option<&str> {
        self.names
            .get(row.index())
            .and_then(|id| self.strings.get(*id))
    }

    pub fn slug(&self, row: ItemId) -> Option<&str> {
        self.slugs
            .get(row.index())
            .and_then(|id| self.strings.get(*id))
    }

    pub fn image_key(&self, row: ItemId) -> Option<&str> {
        self.image_keys
            .get(row.index())
            .and_then(|id| self.strings.get(*id))
    }

    pub fn rarity(&self, row: ItemId) -> Option<ItemRarity> {
        self.rarities.get(row.index()).copied()
    }
}

#[cfg(test)]
mod tests {
    use super::{CatalogColumns, CatalogItemInput};
    use crate::ItemRarity;

    #[test]
    fn pushes_item_into_columns() {
        let mut catalog = CatalogColumns::new();
        let row = catalog.push(CatalogItemInput {
            item_id: "Wooden Sword".to_string(),
            name: "Wooden Sword".to_string(),
            rarity: ItemRarity::Common,
            first_tooltip: None,
        });

        assert_eq!(row.raw(), 0);
        assert_eq!(catalog.len(), 1);
        assert_eq!(catalog.item_id(row), Some("Wooden Sword"));
        assert_eq!(catalog.name(row), Some("Wooden Sword"));
        assert_eq!(catalog.slug(row), Some("wooden-sword"));
        assert_eq!(catalog.image_key(row), Some("wooden-sword"));
        assert_eq!(catalog.rarity(row), Some(ItemRarity::Common));
    }

    #[test]
    fn string_pool_reuses_equal_pairs() {
        let mut catalog = CatalogColumns::new();
        catalog.push(CatalogItemInput {
            item_id: "Apple".to_string(),
            name: "Apple".to_string(),
            rarity: ItemRarity::Common,
            first_tooltip: None,
        });

        // String interning is case-sensitive: "Apple" and "apple" are different,
        // but equal item_id/name and equal slug/image_key share ids.
        assert_eq!(catalog.item_ids[0], catalog.names[0]);
        assert_eq!(catalog.slugs[0], catalog.image_keys[0]);
        assert_eq!(catalog.string_count(), 2);
    }

    #[test]
    fn image_key_uses_masked_items() {
        let mut catalog = CatalogColumns::new();
        let row = catalog.push(CatalogItemInput {
            item_id: "Suspicious Sausage".to_string(),
            name: "Suspicious Sausage".to_string(),
            rarity: ItemRarity::Special,
            first_tooltip: None,
        });

        assert_eq!(catalog.image_key(row), Some("tender-sausage"));
    }
}
