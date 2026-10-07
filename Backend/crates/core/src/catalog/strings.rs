use super::StringId;
use std::collections::BTreeMap;

/// Minimal deterministic string interner.
///
/// This is intentionally small: it is a foundation for future catalog/string
/// packs, not a general-purpose global string cache.
#[derive(Debug, Clone, Default)]
pub struct StringPool {
    values: Vec<String>,
    index: BTreeMap<String, StringId>,
}

impl StringPool {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn intern(&mut self, value: impl AsRef<str>) -> StringId {
        let value = value.as_ref();
        if let Some(id) = self.index.get(value) {
            return *id;
        }

        let id = StringId::new(self.values.len() as u32);
        let owned = value.to_string();
        self.values.push(owned.clone());
        self.index.insert(owned, id);
        id
    }

    pub fn get(&self, id: StringId) -> Option<&str> {
        self.values.get(id.index()).map(String::as_str)
    }

    pub fn len(&self) -> usize {
        self.values.len()
    }

    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }

    pub fn iter(&self) -> impl Iterator<Item = (StringId, &str)> {
        self.values
            .iter()
            .enumerate()
            .map(|(index, value)| (StringId::new(index as u32), value.as_str()))
    }
}

#[cfg(test)]
mod tests {
    use super::StringPool;

    #[test]
    fn identical_strings_share_id() {
        let mut pool = StringPool::new();
        let first = pool.intern("Wooden Sword");
        let second = pool.intern("Wooden Sword");

        assert_eq!(first, second);
        assert_eq!(pool.len(), 1);
        assert_eq!(pool.get(first), Some("Wooden Sword"));
    }

    #[test]
    fn different_strings_get_different_ids_in_insert_order() {
        let mut pool = StringPool::new();
        let sword = pool.intern("Wooden Sword");
        let apple = pool.intern("Apple");

        assert_ne!(sword, apple);
        assert_eq!(sword.raw(), 0);
        assert_eq!(apple.raw(), 1);
        assert_eq!(
            pool.iter().collect::<Vec<_>>(),
            vec![(sword, "Wooden Sword"), (apple, "Apple")]
        );
    }
}
