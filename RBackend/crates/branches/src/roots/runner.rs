//! `BranchRunner` — превращает `BranchSpec` всех веток в маршруты Axum и запускает сервер.
//!
//! Один процесс отдаёт всё: HTML веток (SSR), серверные функции островов (`/_fn/*`),
//! WASM/CSS (`/pkg`), картинки и шрифты из `Frontend/Web/static`, а также маршруты
//! `api` (`/api/*`, `/health`, `/sitemap.xml`, …). Если задан `API_SECRET`, всё, кроме
//! открытых маршрутов `api`, требует заголовок `X-Internal-Secret` (его ставит Cloudflare).

use super::{shell, Dict, Gen, LazyIslands};
use crate::catalog::{Catalog, CatalogHandle};
use axum::{
    body::Body,
    http::{header, HeaderValue, Request},
    middleware,
    routing::get,
    Router,
};
use leptos::prelude::*;
use leptos_axum::{handle_server_fns_with_context, render_app_async_with_context};
use std::{path::Path, sync::Arc};
use tower_http::{
    compression::CompressionLayer, services::ServeDir, set_header::SetResponseHeader,
};

type BoxError = Box<dyn std::error::Error + Send + Sync>;

/// Сборщик и запускатель сайта.
pub struct BranchRunner;

impl BranchRunner {
    /// Читает конфигурацию Leptos (`LEPTOS_*` или `Cargo.toml`), каталог и словари, слушает `site_addr`.
    ///
    /// # Errors
    /// Нет конфигурации или паков, не читаются словари, порт занят, сайт собран без `--split`.
    pub async fn serve() -> Result<(), BoxError> {
        // Leptos запускает фоновые задачи рендера через глобальный executor.
        any_spawner::Executor::init_tokio()?;
        let options = get_configuration(None)?.leptos_options;
        LazyIslands::load(&options)?;
        let state = api::AppState::discover().await?;
        let catalog = CatalogHandle(Arc::new(Catalog::load(&state.project_root)?));
        let dict = Dict::load(&state.project_root)?;
        let addr = options.site_addr;
        let app = Self::router(options, state, catalog, dict);
        tracing::info!(%addr, "starting Backpack Insight site");
        let listener = tokio::net::TcpListener::bind(addr).await?;
        axum::serve(listener, app)
            .with_graceful_shutdown(api::shutdown_signal())
            .await?;
        Ok(())
    }

    /// Маршрутизатор сайта: по маршруту на каждую ветку из `Gen` плюс статика и API.
    pub fn router(
        options: LeptosOptions,
        state: api::AppState,
        catalog: CatalogHandle,
        dict: Dict,
    ) -> Router {
        let context = move || {
            provide_context(catalog.clone());
            provide_context(dict.clone());
        };
        let shell_options = options.clone();
        let render =
            render_app_async_with_context(context.clone(), move || shell(shell_options.clone()));
        let server_fns =
            move |req: Request<Body>| handle_server_fns_with_context(context.clone(), req);

        let mut pages = Router::new();
        for entry in Gen::branches() {
            pages = pages.route(&entry.spec.axum_path(), get(render.clone()));
        }
        let pkg = Path::new(&*options.site_root).join(&*options.site_pkg_dir);
        let static_dir = state.project_root.join("Frontend/Web/static");
        pages
            .route("/_fn/{*fn_name}", get(server_fns.clone()).post(server_fns))
            .nest_service("/pkg", cached(ServeDir::new(pkg), "public, max-age=3600"))
            .nest_service(
                "/images",
                cached(
                    ServeDir::new(static_dir.join("images")),
                    "public, max-age=2592000",
                ),
            )
            .nest_service(
                "/fonts",
                cached(
                    ServeDir::new(static_dir.join("fonts")),
                    "public, max-age=31536000, immutable",
                ),
            )
            .fallback(render)
            // Сайт, как и `/api`, отвечает только Cloudflare с секретом `X-Internal-Secret`
            // (если он задан); `/health` и прочие маршруты `api` защищает сам `api`.
            .layer(middleware::from_fn_with_state(
                state.clone(),
                api::require_api_secret,
            ))
            .merge(api::routes(state))
            .layer(CompressionLayer::new())
    }
}

fn cached<S>(service: S, value: &'static str) -> SetResponseHeader<S, HeaderValue> {
    SetResponseHeader::if_not_present(
        service,
        header::CACHE_CONTROL,
        HeaderValue::from_static(value),
    )
}
