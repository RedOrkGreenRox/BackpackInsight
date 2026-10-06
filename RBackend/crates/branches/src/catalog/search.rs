//! Поиск по каталогу и нарезка результатов на порции.
//!
//! Сейчас это простой поиск: запрос режется на слова, и предмет подходит,
//! если каждое слово встречается в его `search_text` (имя, id, герой, типы, редкость).
//! Полный синтаксис расширенного поиска (`docs/search_filter_syntax.md`) переносится
//! следующим шагом.

use super::LangCatalog;
use crate::model::{ItemsPage, PAGE_SIZE};

/// Верхняя граница номера порции, чтобы `?page=` не заставлял рендерить лишнее.
pub const MAX_PAGE: usize = 40;

/// Результаты поиска с первой порции по `page` включительно.
///
/// Так ссылка «Показать ещё» без JavaScript (`?page=N`) показывает
/// всё, что пользователь уже видел, плюс новую порцию.
#[must_use]
pub fn search_upto(catalog: &LangCatalog, query: &str, page: usize) -> ItemsPage {
    let page = page.min(MAX_PAGE);
    let matched = matching(catalog, query);
    let end = ((page + 1) * PAGE_SIZE).min(matched.len());
    ItemsPage {
        cards: matched[..end].iter().map(|item| item.card()).collect(),
        total: matched.len(),
        page,
        has_more: end < matched.len(),
    }
}

/// Одна порция результатов (для острова «Показать ещё»).
#[must_use]
pub fn search_page(catalog: &LangCatalog, query: &str, page: usize) -> ItemsPage {
    let page = page.min(MAX_PAGE);
    let matched = matching(catalog, query);
    let start = (page * PAGE_SIZE).min(matched.len());
    let end = (start + PAGE_SIZE).min(matched.len());
    ItemsPage {
        cards: matched[start..end].iter().map(|item| item.card()).collect(),
        total: matched.len(),
        page,
        has_more: end < matched.len(),
    }
}

fn matching<'a>(catalog: &'a LangCatalog, query: &str) -> Vec<&'a super::CatalogItem> {
    let words: Vec<String> = query.split_whitespace().map(str::to_lowercase).collect();
    catalog
        .items()
        .iter()
        .filter(|item| {
            words
                .iter()
                .all(|word| item.search_text.contains(word.as_str()))
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::catalog::CatalogItem;
    use rbackend_core::{CombatStats, ItemDef, ItemRarity, Levels};
    use std::collections::BTreeMap;

    fn item(name: &str) -> CatalogItem {
        let def = ItemDef {
            id: name.into(),
            name: name.into(),
            rarity: ItemRarity::Common,
            coin_value: 1,
            item_types: vec![],
            connected_hero: "Shared".into(),
            unlock_source: "Default".into(),
            item_shape: vec![],
            item_stars: vec![],
            purchasable: false,
            embargoed: false,
            recipes: vec![],
            combat_stats: CombatStats::default(),
            tooltips: vec![],
            all_stats: BTreeMap::new(),
            levels: Levels {
                max_level: 1,
                chance_per_level: None,
                base_chance: None,
                chance_breakpoint_bonus: None,
                ability_description: None,
                changes: vec![],
            },
        };
        CatalogItem::new(def, name.to_lowercase())
    }

    #[test]
    fn every_word_must_match() {
        let catalog = LangCatalog::new(vec![item("Wooden Sword"), item("Wooden Shield")]);
        assert_eq!(search_upto(&catalog, "wooden", 0).total, 2);
        assert_eq!(search_upto(&catalog, "WOODEN sw", 0).total, 1);
        assert_eq!(search_upto(&catalog, "axe", 0).total, 0);
    }

    #[test]
    fn pages_are_cumulative_or_single() {
        let items = (0..PAGE_SIZE + 5)
            .map(|i| item(&format!("Item{i}")))
            .collect();
        let catalog = LangCatalog::new(items);
        let first = search_upto(&catalog, "", 0);
        assert_eq!((first.cards.len(), first.has_more), (PAGE_SIZE, true));
        assert_eq!(search_upto(&catalog, "", 1).cards.len(), PAGE_SIZE + 5);
        let second = search_page(&catalog, "", 1);
        assert_eq!((second.cards.len(), second.has_more), (5, false));
    }
}
