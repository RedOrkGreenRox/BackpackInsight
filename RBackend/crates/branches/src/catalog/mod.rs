//! Каталог предметов на сервере.
//!
//! Читается один раз на старте из FlatBuffers-паков `RBackend/generated/api_items_{en,ru}.fb`
//! и дальше живёт в памяти. В браузер каталог целиком не уходит: страницы получают
//! готовый HTML, а остров каталога — порции по [`crate::model::PAGE_SIZE`] карточек.

mod fields;
mod item;
mod load;
mod rarity;
mod search;

pub use item::CatalogItem;
pub use search::{search_page, search_upto, MAX_PAGE};

use crate::model::Lang;
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
        items.sort_by_key(|item| rarity::rank(&item.rarity));
        let by_slug = items
            .iter()
            .enumerate()
            .map(|(i, it)| (it.slug.clone(), i))
            .collect();
        let by_id = items
            .iter()
            .enumerate()
            .map(|(i, it)| (it.id.clone(), i))
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
    /// Загружает оба пака из `{project_root}/RBackend/generated`.
    ///
    /// # Errors
    /// Пак не читается или повреждён, либо предмет в паке — не объект.
    pub fn load(project_root: &Path) -> Result<Self, String> {
        let generated = project_root.join("RBackend/generated");
        let en = load::load_items(&generated.join("api_items_en.fb"), None)?;
        let images = en
            .iter()
            .map(|it| (it.id.clone(), it.image.clone()))
            .collect();
        let ru = load::load_items(&generated.join("api_items_ru.fb"), Some(&images))?;
        let pictures = project_root.join("Frontend/Web/static/images/items/webp");
        let [en, ru] =
            [en, ru].map(|items| LangCatalog::new(drop_missing_images(items, &pictures)));
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

/// Обнуляет ключ картинки, если файла нет: карточка покажет заглушку без JavaScript.
fn drop_missing_images(mut items: Vec<CatalogItem>, pictures: &Path) -> Vec<CatalogItem> {
    for item in &mut items {
        if !pictures.join(format!("{}.webp", item.image)).is_file() {
            item.image.clear();
        }
    }
    items
}

/// Разделяемый дескриптор каталога для контекста Leptos и серверных функций.
#[derive(Clone, Debug)]
pub struct CatalogHandle(pub Arc<Catalog>);
