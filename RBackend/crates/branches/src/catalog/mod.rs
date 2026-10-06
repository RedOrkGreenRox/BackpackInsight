//! Каталог предметов на сервере.
//!
//! Читается один раз на старте из `RBackend/generated/items_{en,ru}.json` в строгую модель
//! `rbackend_core::ItemDef` и дальше живёт в памяти. В браузер каталог целиком не уходит: страницы получают
//! готовый HTML, а остров каталога — порции по [`crate::model::PAGE_SIZE`] карточек.

mod art;
mod item;
mod load;
mod rarity;
mod search;

pub use item::CatalogItem;
pub use search::{search_page, search_upto, MAX_PAGE};

use crate::model::Lang;
use art::{ArtIndex, ART_DIR};
use std::{collections::HashMap, path::Path, sync::Arc};

/// Каталог одного языка: предметы по убыванию редкости (внутри редкости — в порядке пака)
/// и индексы по слагу и `id`.
#[derive(Debug, Default)]
pub struct LangCatalog {
    items: Vec<CatalogItem>,
    by_slug: HashMap<String, usize>,
    by_id: HashMap<String, usize>,
}

impl LangCatalog {
    /// Собирает каталог и индексы из списка предметов. Порядок по умолчанию —
    /// «редкость по убыванию», как сортировка по умолчанию в TS-версии.
    #[must_use]
    pub fn new(mut items: Vec<CatalogItem>) -> Self {
        items.sort_by_key(|item| rarity::rank(item.def.rarity));
        let by_slug = items
            .iter()
            .enumerate()
            .map(|(i, it)| (it.slug.clone(), i))
            .collect();
        let by_id = items
            .iter()
            .enumerate()
            .map(|(i, it)| (it.def.id.clone(), i))
            .collect();
        Self {
            items,
            by_slug,
            by_id,
        }
    }

    /// Все предметы в порядке каталога.
    #[must_use]
    pub fn items(&self) -> &[CatalogItem] {
        &self.items
    }

    /// Предмет и его позиция по слагу.
    #[must_use]
    pub fn by_slug(&self, slug: &str) -> Option<(usize, &CatalogItem)> {
        let index = *self.by_slug.get(slug)?;
        Some((index, &self.items[index]))
    }

    /// Предмет по исходному `id` (английское имя из экспорта игры).
    #[must_use]
    pub fn by_id(&self, id: &str) -> Option<&CatalogItem> {
        self.by_id.get(id).map(|&index| &self.items[index])
    }
}

/// Каталоги всех языков.
#[derive(Debug, Default)]
pub struct Catalog {
    en: LangCatalog,
    ru: LangCatalog,
}

impl Catalog {
    /// Загружает оба каталога из `{project_root}/RBackend/generated`.
    ///
    /// # Errors
    /// Файл каталога не читается или не совпадает с моделью экспорта.
    pub fn load(project_root: &Path) -> Result<Self, String> {
        let generated = project_root.join("RBackend/generated");
        let art = ArtIndex::load(&project_root.join(format!(
            "Frontend/Web/static/images/{ART_DIR}/manifest.json"
        )))?;
        let en = LangCatalog::new(load::load_items(&generated.join("items_en.json"), &art)?);
        let ru = LangCatalog::new(load::load_items(&generated.join("items_ru.json"), &art)?);
        Ok(Self { en, ru })
    }

    /// Каталог нужного языка.
    #[must_use]
    pub fn lang(&self, lang: Lang) -> &LangCatalog {
        match lang {
            Lang::En => &self.en,
            Lang::Ru => &self.ru,
        }
    }
}

/// Разделяемый дескриптор каталога для контекста Leptos и серверных функций.
#[derive(Clone, Debug)]
pub struct CatalogHandle(pub Arc<Catalog>);
