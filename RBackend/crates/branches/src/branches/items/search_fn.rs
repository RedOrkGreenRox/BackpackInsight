//! Серверная функция поиска для острова `ItemsManager`.
//!
//! `GET /_fn/items?lang=…&q=…&page=…` — запрос через GET, чтобы ответы
//! кэшировались браузером и Cloudflare.

use crate::model::{ItemsPage, Lang};
use leptos::prelude::*;
use leptos::server_fn::codec::GetUrl;

/// Максимальная длина поискового запроса в символах.
pub const MAX_QUERY: usize = 200;

/// Одна порция результатов поиска (`page` — номер порции с нуля).
#[allow(clippy::unused_async)] // серверные функции Leptos обязаны быть async
#[server(prefix = "/_fn", endpoint = "items", input = GetUrl)]
pub async fn search_items(lang: Lang, q: String, page: usize) -> Result<ItemsPage, ServerFnError> {
    use crate::catalog::{search_page, CatalogHandle};
    use axum::http::{header, HeaderValue};

    let catalog = expect_context::<CatalogHandle>();
    if let Some(response) = use_context::<leptos_axum::ResponseOptions>() {
        response.insert_header(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=300"),
        );
    }
    let query: String = q.chars().take(MAX_QUERY).collect();
    Ok(search_page(catalog.0.lang(lang), &query, page))
}
