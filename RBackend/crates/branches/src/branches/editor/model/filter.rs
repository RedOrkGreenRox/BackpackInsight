//! [`Filter`] — поиск, фильтры и сортировка каталога редактора.

use super::kit::{Kit, KitItem, SHARED_HERO};

/// Что показывать: всё, только сумки или только предметы.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum Kind {
    /// Всё.
    #[default]
    All,
    /// Только сумки.
    Bags,
    /// Всё, кроме сумок.
    Items,
}

/// Порядок каталога.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum SortBy {
    /// От ценной редкости к простой (порядок каталога).
    #[default]
    Rarity,
    /// По имени.
    Name,
    /// От дорогих к дешёвым.
    Price,
}

impl Kind {
    /// Все варианты и их значения в `<select>`.
    pub const ALL: [(Self, &'static str); 3] = [
        (Self::All, "all"),
        (Self::Bags, "bags"),
        (Self::Items, "items"),
    ];

    /// Вариант по значению `<select>`.
    #[must_use]
    pub fn parse(code: &str) -> Self {
        Self::ALL
            .iter()
            .find(|(_, c)| *c == code)
            .map_or_else(Self::default, |(k, _)| *k)
    }
}

impl SortBy {
    /// Все варианты и их значения в `<select>`.
    pub const ALL: [(Self, &'static str); 3] = [
        (Self::Rarity, "rarity"),
        (Self::Name, "name"),
        (Self::Price, "price"),
    ];

    /// Вариант по значению `<select>`.
    #[must_use]
    pub fn parse(code: &str) -> Self {
        Self::ALL
            .iter()
            .find(|(_, c)| *c == code)
            .map_or_else(Self::default, |(s, _)| *s)
    }
}

/// Состояние панели каталога.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Filter {
    /// Строка поиска.
    pub query: String,
    /// Герой: его предметы и общие. `None` — все.
    pub hero: Option<String>,
    /// Сумки или предметы.
    pub kind: Kind,
    /// Редкость. `None` — любая.
    pub rarity: Option<String>,
    /// Порядок.
    pub sort: SortBy,
}

impl Filter {
    /// Подходит ли предмет.
    #[must_use]
    pub fn accepts(&self, item: &KitItem, query: &str) -> bool {
        let hero_ok = self
            .hero
            .as_ref()
            .is_none_or(|hero| item.hero == *hero || item.hero == SHARED_HERO);
        let kind_ok = match self.kind {
            Kind::All => true,
            Kind::Bags => item.is_bag(),
            Kind::Items => !item.is_bag(),
        };
        let rarity_ok = self.rarity.as_ref().is_none_or(|r| item.rarity == *r);
        let text_ok = query.is_empty()
            || item.name.to_lowercase().contains(query)
            || item.id.to_lowercase().contains(query)
            || item.types.iter().any(|t| t.to_lowercase().contains(query));
        hero_ok && kind_ok && rarity_ok && text_ok
    }

    /// Номера подходящих предметов в нужном порядке.
    #[must_use]
    pub fn apply(&self, kit: &Kit) -> Vec<usize> {
        let query = self.query.trim().to_lowercase();
        let mut found: Vec<usize> = (0..kit.items.len())
            .filter(|&i| self.accepts(kit.item(i), &query))
            .collect();
        match self.sort {
            SortBy::Rarity => found.sort_by_key(|&i| kit.item(i).rarity_rank),
            SortBy::Name => found.sort_by(|&a, &b| kit.item(a).name.cmp(&kit.item(b).name)),
            SortBy::Price => found.sort_by_key(|&i| std::cmp::Reverse(kit.item(i).price)),
        }
        found
    }
}

/// Редкости набора в порядке от ценной к простой.
#[must_use]
pub fn rarities(kit: &Kit) -> Vec<String> {
    let mut list: Vec<(u8, String)> = kit
        .items
        .iter()
        .map(|it| (it.rarity_rank, it.rarity.clone()))
        .collect();
    list.sort();
    list.dedup();
    list.into_iter().map(|(_, name)| name).collect()
}
