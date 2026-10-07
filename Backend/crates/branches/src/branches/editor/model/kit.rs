//! [`Kit`] — предметы для редактора: то, что нужно полю, каталогу и обмену билдами.
//!
//! Сервер собирает набор из каталога одного языка и отдаёт его острову одним
//! ответом серверной функции; дальше поиск, фильтры и проверка размещения
//! работают в браузере без запросов.

use super::cell::{Bounds, Cell};
use crate::model::ItemImage;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Тип предмета, который превращает его в сумку.
pub const BAG_TYPE: &str = "Bag";
/// Герой у общих предметов.
pub const SHARED_HERO: &str = "Shared";

/// Предмет для редактора.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct KitItem {
    /// `id` из экспорта игры (английское имя), ключ в файле билда.
    pub id: String,
    /// Слаг, ключ в адресе страницы.
    pub slug: String,
    /// Отображаемое имя.
    pub name: String,
    /// Редкость (`Common`, …).
    pub rarity: String,
    /// Место редкости, 0 — самая ценная.
    pub rarity_rank: u8,
    /// Герой предмета; `Shared` — общий.
    pub hero: String,
    /// Типы и теги.
    pub types: Vec<String>,
    /// Цена в монетах.
    pub price: u32,
    /// Клетки формы при повороте `Up`.
    pub shape: Vec<Cell>,
    /// Клетки-звёзды при повороте `Up`.
    pub stars: Vec<Cell>,
    /// Картинка (рисует форму при повороте `Up`).
    pub image: ItemImage,
    /// Картинка сумки в инвентаре; пустая — та же, что `image`.
    pub placed: ItemImage,
}

impl KitItem {
    /// Сумка ли это: сумки открывают клетки поля.
    #[must_use]
    pub fn is_bag(&self) -> bool {
        self.types.iter().any(|t| t == BAG_TYPE)
    }

    /// Картинка на поле и на складе: у общих сумок она «открытая».
    #[must_use]
    pub fn placed_image(&self) -> &ItemImage {
        if self.placed.is_empty() {
            &self.image
        } else {
            &self.placed
        }
    }

    /// Охват формы при повороте `Up`; у пустой формы — одна клетка.
    #[must_use]
    pub fn bounds(&self) -> Bounds {
        Bounds::of(&self.shape).unwrap_or(Bounds {
            min: Cell::default(),
            max: Cell::default(),
        })
    }
}

/// Набор предметов одной версии игры на одном языке.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Kit {
    /// Версия игры (`7.0.0`).
    pub version: String,
    /// Предметы в порядке каталога.
    pub items: Vec<KitItem>,
    /// `id` → номер в `items`; строится в [`Kit::new`], по сети не передаётся.
    #[serde(skip)]
    by_id: HashMap<String, usize>,
    /// Слаг → номер в `items`.
    #[serde(skip)]
    by_slug: HashMap<String, usize>,
}

impl Kit {
    /// Набор с индексами по `id` и слагу.
    #[must_use]
    pub fn new(version: String, items: Vec<KitItem>) -> Self {
        let by_id = items
            .iter()
            .enumerate()
            .map(|(i, it)| (it.id.clone(), i))
            .collect();
        let by_slug = items
            .iter()
            .enumerate()
            .map(|(i, it)| (it.slug.clone(), i))
            .collect();
        Self {
            version,
            items,
            by_id,
            by_slug,
        }
    }

    /// Восстанавливает индексы после десериализации.
    #[must_use]
    pub fn indexed(self) -> Self {
        Self::new(self.version, self.items)
    }

    /// Предмет по номеру. Номер всегда из этого же набора.
    #[must_use]
    pub fn item(&self, piece: usize) -> &KitItem {
        &self.items[piece]
    }

    /// Номер предмета по `id` из экспорта игры.
    #[must_use]
    pub fn by_id(&self, id: &str) -> Option<usize> {
        self.by_id.get(id).copied()
    }

    /// Номер предмета по слагу.
    #[must_use]
    pub fn by_slug(&self, slug: &str) -> Option<usize> {
        self.by_slug.get(slug).copied()
    }

    /// Герои, у которых есть свои предметы, по алфавиту (без `Shared`).
    #[must_use]
    pub fn heroes(&self) -> Vec<String> {
        let mut heroes: Vec<String> = self
            .items
            .iter()
            .map(|it| it.hero.clone())
            .filter(|hero| hero != SHARED_HERO)
            .collect();
        heroes.sort();
        heroes.dedup();
        heroes
    }
}
