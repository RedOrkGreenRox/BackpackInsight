//! Серверная функция набора предметов для острова `EditorManager`.
//!
//! `GET /_fn/editor_kit?lang=…` — один ответ на страницу; браузер и Cloudflare
//! кэшируют его, как и порции каталога.

use super::model::Kit;
use crate::model::Lang;
use leptos::prelude::*;
use leptos::server_fn::codec::GetUrl;

/// Все предметы текущей версии игры, кроме скрытых до выхода обновления.
#[allow(clippy::unused_async)] // серверные функции Leptos обязаны быть async
#[server(prefix = "/_fn", endpoint = "editor_kit", input = GetUrl)]
pub async fn editor_kit(lang: Lang) -> Result<Kit, ServerFnError> {
    use crate::catalog::CatalogHandle;
    use axum::http::{header, HeaderValue};

    let catalog = expect_context::<CatalogHandle>();
    if let Some(response) = use_context::<leptos_axum::ResponseOptions>() {
        response.insert_header(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=300"),
        );
    }
    Ok(build::kit(catalog.0.lang(lang)))
}

#[cfg(feature = "ssr")]
mod build {
    use super::super::model::{Cell, Kit, KitItem};
    use crate::catalog::{rarity_rank, CatalogItem, LangCatalog};

    /// Набор из каталога одного языка.
    pub fn kit(catalog: &LangCatalog) -> Kit {
        let items = catalog
            .items()
            .iter()
            .filter(|item| !item.def.embargoed)
            .map(kit_item)
            .collect();
        Kit::new(catalog.version().to_owned(), items)
    }

    fn kit_item(item: &CatalogItem) -> KitItem {
        let cells = |list: &[backend_core::Cell]| {
            list.iter()
                .map(|c| Cell::new(i16::from(c.x), i16::from(c.y)))
                .collect()
        };
        let def = &item.def;
        KitItem {
            id: def.id.clone(),
            slug: item.slug.clone(),
            name: def.name.clone(),
            rarity: def.rarity.to_string(),
            rarity_rank: rarity_rank(def.rarity),
            hero: def.connected_hero.clone(),
            types: def.item_types.clone(),
            price: def.coin_value,
            shape: cells(&def.item_shape),
            stars: cells(&def.item_stars),
            image: item.image.clone(),
            placed: item.placed.clone(),
        }
    }
}
