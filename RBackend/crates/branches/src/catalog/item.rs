//! `CatalogItem` — предмет каталога в типизированном виде.
//!
//! Собирается из объекта пака функцией [`CatalogItem::from_object`]. Здесь только поля,
//! нужные каталогу и его фильтрам; форма на сетке, рецепты и статы понадобятся
//! странице предмета, дизайн которой ещё не утверждён.

use super::fields::{self, Object};
use crate::model::ItemCard;

/// Предмет каталога одного языка.
#[derive(Clone, Debug, PartialEq)]
pub struct CatalogItem {
    /// Исходный `id` (английское имя, общее для всех языков).
    pub id: String,
    /// Слаг для URL, считается из `id` через `SlugService`.
    pub slug: String,
    /// Отображаемое имя на языке пака.
    pub name: String,
    /// Редкость.
    pub rarity: String,
    /// Цена в монетах.
    pub coin_value: Option<i64>,
    /// Типы предмета (`Armor`, `Food`, …).
    pub item_types: Vec<String>,
    /// Герой, к которому привязан предмет.
    pub hero: Option<String>,
    /// Источник разблокировки.
    pub unlock_source: Option<String>,
    /// Продаётся ли в магазине.
    pub purchasable: bool,
    /// Тексты способностей.
    pub tooltips: Vec<String>,
    /// Ключ картинки (`ItemIconService`).
    pub image: String,
    /// Строка для поиска: имя, id, герой, типы, редкость в нижнем регистре.
    pub search_text: String,
}

impl CatalogItem {
    /// Собирает предмет из объекта пака. `image` вычисляется снаружи,
    /// потому что зависит от английского текста (см. `load`).
    pub fn from_object(fallback_id: &str, object: &Object, image: String) -> Self {
        let id = fields::string(object, "id").unwrap_or_else(|| fallback_id.to_string());
        let name = fields::string(object, "name").unwrap_or_else(|| id.clone());
        let rarity = fields::string(object, "rarity").unwrap_or_default();
        let item_types = fields::strings(object, "itemTypes");
        let hero = fields::string(object, "connectedHero").filter(|h| !h.is_empty());
        let search_text = [
            name.as_str(),
            id.as_str(),
            hero.as_deref().unwrap_or(""),
            rarity.as_str(),
        ]
        .into_iter()
        .chain(item_types.iter().map(String::as_str))
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase();
        Self {
            slug: rbackend_core::SlugService::to_slug(id.as_str()).to_string(),
            coin_value: fields::int(object, "coinValue"),
            unlock_source: fields::string(object, "unlockSource"),
            purchasable: fields::boolean(object, "purchasable").unwrap_or(false),
            tooltips: fields::strings(object, "tooltips"),
            id,
            name,
            rarity,
            item_types,
            hero,
            image,
            search_text,
        }
    }

    /// Карточка для сетки каталога.
    #[must_use]
    pub fn card(&self) -> ItemCard {
        ItemCard {
            slug: self.slug.clone(),
            name: self.name.clone(),
            rarity: self.rarity.clone(),
            image: self.image.clone(),
        }
    }
}
