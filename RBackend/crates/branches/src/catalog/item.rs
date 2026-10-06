//! `CatalogItem` — предмет каталога: строгая запись экспорта игры плюс то, что нужно сайту.
//!
//! Все данные игры (форма, звёзды, рецепты, уровни, статы) лежат в [`ItemDef`] без потерь,
//! поэтому будущему полю предметов не нужен второй источник.

use crate::model::{ItemCard, ItemImage};
use rbackend_core::{ItemDef, SlugService};

/// Предмет каталога одного языка.
#[derive(Clone, Debug, PartialEq)]
pub struct CatalogItem {
    /// Предмет из экспорта игры.
    pub def: ItemDef,
    /// Слаг для URL, считается из `id` через `SlugService`.
    pub slug: String,
    /// Картинка из манифеста `art`; пустая, если её нет.
    pub image: ItemImage,
    /// Строка для поиска: имя, id, герой, редкость, типы в нижнем регистре.
    pub search_text: String,
}

impl CatalogItem {
    /// Собирает предмет; `image` берётся из манифеста `art` по `id` (см. `load`).
    #[must_use]
    pub fn new(def: ItemDef, image: ItemImage) -> Self {
        let search_text = [
            def.name.as_str(),
            def.id.as_str(),
            def.connected_hero.as_str(),
            def.rarity.as_str(),
        ]
        .into_iter()
        .chain(def.item_types.iter().map(String::as_str))
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase();
        Self {
            slug: SlugService::to_slug(def.id.as_str()).to_string(),
            def,
            image,
            search_text,
        }
    }

    /// Карточка для сетки каталога.
    #[must_use]
    pub fn card(&self) -> ItemCard {
        ItemCard {
            slug: self.slug.clone(),
            name: self.def.name.clone(),
            rarity: self.def.rarity.to_string(),
            image: self.image.clone(),
        }
    }
}
